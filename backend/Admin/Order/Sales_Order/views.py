from django.shortcuts import render
from django.db import transaction

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import SalesOrder, SalesOrderDetails
from .serializers import SalesOrderSerializer, SalesOrderDetailsSerializer
from ...Customer.utils import (
    check_customer_exists,
    add_customer,
    get_existing_customer_id,
)
from Admin.Delivery.models import OutboundDelivery, OutboundDeliveryDetails
from Account.models import User


# Permission imports
from Admin.authentication import CookieJWTAuthentication
from Admin.AdminPermission import IsAdminUser


# Create your views here.
class SalesOrderListCreateAPIView(APIView):
    """
    Handle listing all Sales Orders and creating a new Sales Order.
    """

    # authentication_classes = [CookieJWTAuthentication]
    # permission_classes = [IsAdminUser]
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        """List all Sales Orders without their details."""
        queryset = SalesOrder.objects.all()
        serializer = SalesOrderSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Create a new Sales Order along with its details."""
        print("Incoming request data:", request.data)
        sales_order_serializer = SalesOrderSerializer(data=request.data)

        # Extract customer data from the incoming request
        customer_data = {
            "name": request.data.get("SALES_ORDER_CLIENT_NAME"),
            "address": request.data.get("SALES_ORDER_CLIENT_CITY"),
            "province": request.data.get("SALES_ORDER_CLIENT_PROVINCE"),
            "phoneNumber": request.data.get("SALES_ORDER_CLIENT_PHONE_NUM"),
        }

        # Check if the customer exists and add them if not
        customer_id = None
        if customer_data and not check_customer_exists(customer_data):
            customer = add_customer(customer_data)
            customer_id = customer.id
        else:
            customer_id = get_existing_customer_id(
                customer_data
            )  # Assuming this function fetches the customer ID

        # Update sales order data with the customer ID
        if customer_id:
            sales_order_data = request.data.copy()
            sales_order_data["CLIENT_ID"] = customer_id
            sales_order_serializer = SalesOrderSerializer(
                data=sales_order_data
            )  # Update serializer with modified data

        if sales_order_serializer.is_valid():
            # Use transaction.atomic() to ensure atomicity
            with transaction.atomic():
                # Save the sales order
                sales_order = sales_order_serializer.save()  # noqa:F841
            return Response(sales_order_serializer.data, status=status.HTTP_201_CREATED)

        print("Serializer errors:", sales_order_serializer.errors)
        return Response(
            sales_order_serializer.errors, status=status.HTTP_400_BAD_REQUEST
        )


class GetPendingTotalView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        try:
            # Query for sales orders with a status of 'pending'
            pending_count = SalesOrder.objects.filter(
                SALES_ORDER_STATUS="Pending"
            ).count()

            # Return the total count in the response
            return Response({"pending_total": pending_count}, status=status.HTTP_200_OK)
        except Exception as e:
            # Handle any unexpected errors
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SalesOrderRetrieveUpdateAPIView(APIView):
    """
    Handle retrieving a specific Sales Order and updating it.
    """

    permission_classes = [permissions.AllowAny]

    def get_object(self, pk):
        try:
            return SalesOrder.objects.prefetch_related("sales_order").get(
                SALES_ORDER_ID=pk
            )
        except SalesOrder.DoesNotExist:
            return None

    def get(self, request, pk):
        """Retrieve a specific Sales Order and its details."""
        sales_order = self.get_object(pk)
        if not sales_order:
            return Response(
                {"error": "Sales Order not found."}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = SalesOrderSerializer(sales_order)
        return Response(serializer.data)

    def patch(self, request, pk):
        """Partially update a Sales Order."""
        sales_order = self.get_object(pk)
        if not sales_order:
            return Response(
                {"error": "Sales Order not found."}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = SalesOrderSerializer(sales_order, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SalesOrderDetailsAPIView(APIView):
    """
    Handle operations for Sales Order Details.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        """Retrieve details for a specific Sales Order."""
        details = SalesOrderDetails.objects.filter(SALES_ORDER_ID=pk)
        if not details.exists():
            return Response(
                {"error": "Sales Order details not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = SalesOrderDetailsSerializer(details, many=True)
        return Response(serializer.data)

    def delete(self, request, pk):
        """Delete details for a specific Sales Order."""
        details = SalesOrderDetails.objects.filter(SALES_ORDER_ID=pk)
        if not details.exists():
            return Response(
                {"error": "Sales Order details not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        details.delete()
        return Response(
            {"message": "Sales Order details deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )


class TransferToOutboundDelivery(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, sales_order_id):
        try:
            with transaction.atomic():  # Start the atomic transaction
                # Fetch the SalesOrder
                sales_order = SalesOrder.objects.get(SALES_ORDER_ID=sales_order_id)

                # Check if the status is being updated to 'Accepted'
                if request.data.get("SALES_ORDER_STATUS") == "Accepted":
                    # Update the sales order status to 'Accepted'
                    sales_order.SALES_ORDER_STATUS = "Accepted"
                    sales_order.save()

                    accepted_by_user = request.data.get("USERNAME")

                    # Create OutboundDelivery from the SalesOrder
                    outbound_delivery = OutboundDelivery.objects.create(
                        SALES_ORDER_ID=sales_order,
                        CLIENT_ID=sales_order.CLIENT_ID,
                        OUTBOUND_DEL_CUSTOMER_NAME=sales_order.SALES_ORDER_CLIENT_NAME,
                        OUTBOUND_DEL_TOTAL_PRICE=sales_order.SALES_ORDER_TOTAL_PRICE,
                        OUTBOUNND_DEL_DISCOUNT=sales_order.SALES_ORDER_TOTAL_DISCOUNT,
                        OUTBOUND_DEL_STATUS="Pending",  # Default status, can be updated later
                        OUTBOUND_DEL_DLVRD_QTY=sales_order.SALES_ORDER_TOTAL_QTY,
                        OUTBOUND_DEL_DLVRY_OPTION=sales_order.SALES_ORDER_DLVRY_OPTION,
                        OUTBOUND_DEL_CITY=sales_order.SALES_ORDER_CLIENT_CITY,
                        OUTBOUND_DEL_PROVINCE=sales_order.SALES_ORDER_CLIENT_PROVINCE,
                        OUTBOUND_DEL_ACCPTD_BY_USER=accepted_by_user,
                    )

                    # Transfer SalesOrderDetails to OutboundDeliveryDetails
                    sales_order_details = SalesOrderDetails.objects.filter(
                        SALES_ORDER_ID=sales_order
                    )
                    for detail in sales_order_details:
                        OutboundDeliveryDetails.objects.create(
                            OUTBOUND_DEL_ID=outbound_delivery,
                            OUTBOUND_DETAILS_PROD_NAME=detail.SALES_ORDER_PROD_NAME,
                            OUTBOUND_DETAILS_PROD_QTY=detail.SALES_ORDER_LINE_QTY,
                            OUTBOUND_DETAILS_SELL_PRICE=detail.SALES_ORDER_LINE_PRICE,
                        )

                    return Response(
                        {
                            "message": "Sales Order accepted and transferred to Outbound Delivery successfully."
                        },
                        status=status.HTTP_200_OK,
                    )

                else:
                    return Response(
                        {
                            "error": "Invalid status update. Only 'Accepted' status can trigger the transfer."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

        except SalesOrder.DoesNotExist:
            return Response(
                {"error": f"Sales Order with ID {sales_order_id} not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
