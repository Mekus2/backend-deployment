# Django imports
import logging
from django.shortcuts import render, get_object_or_404
from django.db import transaction
from django.db.models import Sum
from django.http import Http404

# rest_framework Imports
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

# App imports
from .models import SalesOrder, SalesOrderDetails
from .serializers import SalesOrderSerializer, SalesOrderDetailsSerializer
from ...Customer.utils import (
    check_customer_exists,
    add_customer,
    get_existing_customer_id,
)
from Admin.Delivery.models import OutboundDelivery, OutboundDeliveryDetails
from Admin.Delivery.serializers import (
    CreateOutboundDeliveryDetailsSerializer,
    CreateOutboundDeliverySerializer,
)
from Admin.Product.models import Product

# Permission imports
from Admin.authentication import CookieJWTAuthentication
from Admin.AdminPermission import IsAdminUser

logger = logging.getLogger(__name__)


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
        queryset = SalesOrder.objects.all().order_by(
            "-SALES_ORDER_DATE_CREATED"
        )  # Prefix the field with '-' for descending order
        serializer = SalesOrderSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Create a new Sales Order along with its details, auto-accept if admin."""
        logger.info("Incoming request data: %s", request.data)
        sales_order_serializer = SalesOrderSerializer(data=request.data)

        # Extract customer data from the incoming request
        customer_data = {
            "name": request.data.get("SALES_ORDER_CLIENT_NAME"),
            "address": request.data.get("SALES_ORDER_CLIENT_CITY"),
            "province": request.data.get("SALES_ORDER_CLIENT_PROVINCE"),
            "phoneNumber": request.data.get("SALES_ORDER_CLIENT_PHONE_NUM"),
        }

        try:
            with transaction.atomic():
                # Check if the customer exists and add them if not
                customer_id = None
                if customer_data and not check_customer_exists(customer_data):
                    customer = add_customer(customer_data)
                    customer_id = customer.id
                    logger.info("New customer created with ID: %s", customer_id)
                else:
                    customer_id = get_existing_customer_id(customer_data)
                    logger.info("Existing customer ID: %s", customer_id)

                # Update sales order data with the customer ID
                if customer_id:
                    sales_order_data = request.data.copy()
                    sales_order_data["CLIENT_ID"] = customer_id
                    sales_order_serializer = SalesOrderSerializer(data=sales_order_data)

                if sales_order_serializer.is_valid():
                    # Save the sales order
                    sales_order = sales_order_serializer.save()
                    logger.info(
                        "Sales order created with ID: %s", sales_order.SALES_ORDER_ID
                    )

                    # Check if the user is an admin using `USER_TYPE`
                    user_type = request.data.get("USER_TYPE")
                    if user_type == "admin" or user_type == "Admin":
                        # Automatically process and accept the sales order
                        sales_order.SALES_ORDER_STATUS = "Accepted"
                        sales_order.save()
                        logger.info(
                            "Sales order accepted with ID: %s",
                            sales_order.SALES_ORDER_ID,
                        )

                        # Create an Outbound Delivery associated with the sales order
                        outbound_delivery_data = {
                            "SALES_ORDER_ID": sales_order.SALES_ORDER_ID,
                            "CLIENT_ID": sales_order.CLIENT_ID.id,
                            "OUTBOUND_DEL_CUSTOMER_NAME": sales_order.SALES_ORDER_CLIENT_NAME,
                            "OUTBOUND_DEL_DLVRY_OPTION": sales_order.SALES_ORDER_DLVRY_OPTION,
                            "OUTBOUND_DEL_PYMNT_TERMS": sales_order.SALES_ORDER_PYMNT_TERMS,
                            "OUTBOUND_DEL_PYMNT_OPTION": sales_order.SALES_ORDER_PYMNT_OPTION,
                            "OUTBOUND_DEL_TOTAL_PRICE": sales_order.SALES_ORDER_TOTAL_PRICE,
                            "OUTBOUND_DEL_TOTAL_ORDERED_QTY": sales_order.SALES_ORDER_TOTAL_QTY,
                            "OUTBOUND_DEL_CITY": sales_order.SALES_ORDER_CLIENT_CITY,
                            "OUTBOUND_DEL_PROVINCE": sales_order.SALES_ORDER_CLIENT_PROVINCE,
                            "OUTBOUND_DEL_ACCPTD_BY_USERNAME": request.data.get(
                                "USERNAME"
                            ),
                            "OUTBOUND_DEL_ACCPTD_BY_USER": sales_order.SALES_ORDER_CREATEDBY_USER.id,
                        }
                        delivery_serializer = CreateOutboundDeliverySerializer(
                            data=outbound_delivery_data
                        )
                        if delivery_serializer.is_valid():
                            outbound_delivery = delivery_serializer.save()
                            logger.info(
                                "Outbound delivery created with ID: %s",
                                outbound_delivery.OUTBOUND_DEL_ID,
                            )

                            # Fetch and process sales order details
                            sales_order_details = sales_order.sales_order_details.all()
                            for sales_detail in sales_order_details:
                                outbound_detail_data = {
                                    "OUTBOUND_DEL_ID": outbound_delivery.OUTBOUND_DEL_ID,
                                    "OUTBOUND_DETAILS_PROD_ID": sales_detail.SALES_ORDER_PROD_ID.id,
                                    "OUTBOUND_DETAILS_PROD_NAME": sales_detail.SALES_ORDER_PROD_NAME,
                                    "OUTBOUND_DETAILS_PROD_QTY_ORDERED": sales_detail.SALES_ORDER_LINE_QTY,
                                    "OUTBOUND_DETAILS_LINE_DISCOUNT": sales_detail.SALES_ORDER_LINE_DISCOUNT,
                                    "OUTBOUND_DETAILS_SELL_PRICE": sales_detail.SALES_ORDER_LINE_PRICE,
                                    "OUTBOUND_DETAIL_LINE_TOTAL": sales_detail.SALES_ORDER_LINE_TOTAL,
                                }
                                detail_serializer = (
                                    CreateOutboundDeliveryDetailsSerializer(
                                        data=outbound_detail_data
                                    )
                                )
                                if detail_serializer.is_valid():
                                    detail_serializer.save()
                                    logger.info(
                                        "Outbound delivery detail saved for product ID: %s",
                                        sales_detail.SALES_ORDER_PROD_ID.id,
                                    )
                                else:
                                    logger.error(
                                        "Invalid outbound delivery detail data: %s",
                                        detail_serializer.errors,
                                    )
                                    raise ValueError(
                                        "Invalid outbound delivery detail data"
                                    )

                        else:
                            logger.error(
                                "Invalid outbound delivery data: %s",
                                delivery_serializer.errors,
                            )
                            raise ValueError("Invalid outbound delivery data")

                else:
                    logger.error(
                        "Invalid sales order data: %s", sales_order_serializer.errors
                    )
                    raise ValueError("Invalid sales order data")

            # Return the created sales order data
            return Response(sales_order_serializer.data, status=status.HTTP_201_CREATED)

        except ValueError as e:
            logger.error("ValueError: %s", str(e))
            # If any error occurs, rollback the transaction and return the error
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Exception occurred")
            # Handle any other exceptions
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
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

                # Ensure the status is being updated to 'Accepted'
                if request.data.get("SALES_ORDER_STATUS") == "Accepted":
                    # Update the sales order status to 'Accepted'
                    sales_order.SALES_ORDER_STATUS = "Accepted"
                    sales_order.save()

                    accepted_by_user = request.data.get("USERNAME")

                    # Calculate Total Quantity, Total Discount, Total Revenue, Total Cost, Gross Profit
                    total_qty = (
                        SalesOrderDetails.objects.filter(
                            SALES_ORDER_ID=sales_order
                        ).aggregate(total_qty=Sum("SALES_ORDER_LINE_QTY"))["total_qty"]
                        or 0
                    )
                    total_discount = (
                        SalesOrderDetails.objects.filter(
                            SALES_ORDER_ID=sales_order
                        ).aggregate(total_discount=Sum("SALES_ORDER_LINE_DISCOUNT"))[
                            "total_discount"
                        ]
                        or 0
                    )
                    total_revenue = (
                        SalesOrderDetails.objects.filter(
                            SALES_ORDER_ID=sales_order
                        ).aggregate(total_revenue=Sum("SALES_ORDER_LINE_TOTAL"))[
                            "total_revenue"
                        ]
                        or 0
                    )
                    total_cost = (
                        SalesOrderDetails.objects.filter(
                            SALES_ORDER_ID=sales_order
                        ).aggregate(total_cost=Sum("SALES_ORDER_LINE_COST"))[
                            "total_cost"
                        ]
                        or 0
                    )

                    gross_profit = total_revenue - total_cost

                    # Create OutboundDelivery from the SalesOrder with calculated totals
                    outbound_delivery = OutboundDelivery.objects.create(
                        SALES_ORDER_ID=sales_order,
                        CLIENT_ID=sales_order.CLIENT_ID,
                        OUTBOUND_DEL_CUSTOMER_NAME=sales_order.SALES_ORDER_CLIENT_NAME,
                        OUTBOUND_DEL_TOTAL_PRICE=total_revenue,  # Revenue
                        OUTBOUNND_DEL_DISCOUNT=total_discount,  # Discount
                        OUTBOUND_DEL_STATUS="Pending",  # Default status
                        OUTBOUND_DEL_DLVRD_QTY=total_qty,  # Total Quantity
                        OUTBOUND_DEL_DLVRY_OPTION=sales_order.SALES_ORDER_DLVRY_OPTION,
                        OUTBOUND_DEL_CITY=sales_order.SALES_ORDER_CLIENT_CITY,
                        OUTBOUND_DEL_PROVINCE=sales_order.SALES_ORDER_CLIENT_PROVINCE,
                        OUTBOUND_DEL_ACCPTD_BY_USER=accepted_by_user,
                        OUTBOUND_DEL_COST=total_cost,  # Total Cost (Assuming you have a field for this in OutboundDelivery)
                        OUTBOUND_DEL_GROSS_PROFIT=gross_profit,  # Gross Profit
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
                            "message": "Sales Order accepted and transferred to Outbound Delivery successfully.",
                            "Total Quantity": total_qty,
                            "Total Discount": total_discount,
                            "Total Revenue": total_revenue,
                            "Total Cost": total_cost,
                            "Gross Profit": gross_profit,
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


class SalesOrderUpdateAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def patch(self, request, sales_order_id):
        logger.info("PATCH request received for SalesOrder ID: %s", sales_order_id)

        try:
            with transaction.atomic():
                logger.debug("Fetching SalesOrder with ID: %s", sales_order_id)
                sales_order = get_object_or_404(
                    SalesOrder, SALES_ORDER_ID=sales_order_id
                )
                logger.debug("SalesOrder fetched successfully: %s", sales_order)

                # # Update SalesOrder fields from the request data
                # sales_order.CLIENT_ID = request.data.get(
                #     "CLIENT_ID", sales_order.CLIENT_ID
                # )
                # sales_order.SALES_ORDER_CLIENT_NAME = request.data.get(
                #     "CLIENT_NAME", sales_order.SALES_ORDER_CLIENT_NAME
                # )
                # sales_order.SALES_ORDER_CLIENT_PROVINCE = request.data.get(
                #     "CLIENT_PROVINCE", sales_order.SALES_ORDER_CLIENT_PROVINCE
                # )
                # sales_order.SALES_ORDER_CLIENT_CITY = request.data.get(
                #     "CLIENT_CITY", sales_order.SALES_ORDER_CLIENT_CITY
                # )
                # sales_order.SALES_ORDER_DLVRY_OPTION = request.data.get(
                #     "DELIVERY_OPTION", sales_order.SALES_ORDER_DLVRY_OPTION
                # )
                # sales_order.SALES_ORDER_PYMNT_OPTION = request.data.get(
                #     "PAYMENT_OPTION", sales_order.SALES_ORDER_PYMNT_OPTION
                # )
                # sales_order.save()
                # logger.info("SalesOrder updated successfully: %s", sales_order_id)

                # Check if there is an existing OutboundDelivery for the SalesOrder
                outbound_delivery = OutboundDelivery.objects.filter(
                    SALES_ORDER_ID=sales_order
                ).first()
                logger.debug("OutboundDelivery fetched: %s", outbound_delivery)

                # Update SalesOrderDetails and optionally OutboundDeliveryDetails
                updated_details = request.data.get("details", [])
                existing_details_ids = set()

                for detail_data in updated_details:
                    logger.debug("Processing detail data: %s", detail_data)
                    product_id = detail_data.get("SALES_ORDER_PROD_ID")
                    if not product_id:
                        return Response(
                            {"error": "SALES_ORDER_PROD_ID is required."},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    product_name = detail_data.get("SALES_ORDER_PROD_NAME")
                    quantity = detail_data.get("SALES_ORDER_LINE_QTY")
                    price = detail_data.get("SALES_ORDER_LINE_PRICE")
                    discount = detail_data.get("SALES_ORDER_LINE_DISCOUNT")
                    line_total = detail_data.get("SALES_ORDER_LINE_TOTAL")

                    product = get_object_or_404(Product, id=product_id)
                    logger.debug("Product fetched successfully: %s", product)

                    sales_order_detail, _ = SalesOrderDetails.objects.update_or_create(
                        SALES_ORDER_ID=sales_order,
                        SALES_ORDER_PROD_ID=product,
                        defaults={
                            "SALES_ORDER_PROD_NAME": product_name,
                            "SALES_ORDER_LINE_QTY": quantity,
                            "SALES_ORDER_LINE_PRICE": price,
                            "SALES_ORDER_LINE_DISCOUNT": discount,
                            "SALES_ORDER_LINE_TOTAL": line_total,
                        },
                    )
                    logger.debug("SalesOrderDetails updated: %s", sales_order_detail)
                    existing_details_ids.add(sales_order_detail.SALES_ORDER_DET_ID)

                    if outbound_delivery:
                        OutboundDeliveryDetails.objects.update_or_create(
                            OUTBOUND_DEL_ID=outbound_delivery,
                            OUTBOUND_DETAILS_PROD_ID=product,
                            defaults={
                                "OUTBOUND_DETAILS_PROD_NAME": product_name,
                                "OUTBOUND_DETAILS_PROD_QTY_ORDERED": quantity,
                                "OUTBOUND_DETAILS_SELL_PRICE": price,
                                "OUTBOUND_DETAIL_LINE_TOTAL": line_total,
                            },
                        )
                        logger.debug(
                            "OutboundDeliveryDetails updated for product: %s",
                            product_id,
                        )

                # Remove outdated details
                SalesOrderDetails.objects.filter(SALES_ORDER_ID=sales_order).exclude(
                    SALES_ORDER_DET_ID__in=existing_details_ids
                ).delete()
                logger.info(
                    "Outdated SalesOrderDetails removed for SalesOrder ID: %s",
                    sales_order_id,
                )

                if outbound_delivery:
                    OutboundDeliveryDetails.objects.filter(
                        OUTBOUND_DEL_ID=outbound_delivery
                    ).exclude(
                        OUTBOUND_DETAILS_PROD_ID__in=[
                            detail["SALES_ORDER_PROD_ID"] for detail in updated_details
                        ]
                    ).delete()
                    logger.info(
                        "Outdated OutboundDeliveryDetails removed for OutboundDelivery: %s",
                        outbound_delivery,
                    )

                # Recalculate total quantity and price
                total_qty = SalesOrderDetails.objects.filter(
                    SALES_ORDER_ID=sales_order
                ).aggregate(total_qty=Sum("SALES_ORDER_LINE_QTY"))["total_qty"]
                total_price = SalesOrderDetails.objects.filter(
                    SALES_ORDER_ID=sales_order
                ).aggregate(total_price=Sum("SALES_ORDER_LINE_PRICE"))["total_price"]

                sales_order.SALES_ORDER_TOTAL_QTY = total_qty or 0
                sales_order.SALES_ORDER_TOTAL_PRICE = total_price or 0
                sales_order.save()
                logger.info(
                    "SalesOrder totals updated. Total Qty: %s, Total Price: %s",
                    total_qty,
                    total_price,
                )

                if outbound_delivery:
                    outbound_total_price = OutboundDeliveryDetails.objects.filter(
                        OUTBOUND_DEL_ID=outbound_delivery
                    ).aggregate(outbound_total_price=Sum("OUTBOUND_DETAIL_LINE_TOTAL"))[
                        "outbound_total_price"
                    ]

                    outbound_delivery.OUTBOUND_DEL_TOTAL_ORDERED_QTY = total_qty or 0
                    outbound_delivery.OUTBOUND_DEL_TOTAL_PRICE = (
                        outbound_total_price or 0
                    )
                    outbound_delivery.save()
                    logger.info(
                        "OutboundDelivery totals updated: Total Qty: %s, Total Price: %s",
                        total_qty,
                        outbound_total_price,
                    )

                return Response(
                    {
                        "message": (
                            "Sales Order and related Outbound Delivery updated successfully."
                            if outbound_delivery
                            else "Sales Order updated successfully."
                        ),
                    },
                    status=status.HTTP_200_OK,
                )

        except Http404 as e:
            logger.error("Resource not found: %s", e)
            return Response(
                {"error": f"Resource not found: {str(e)}"},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:
            logger.error("An unexpected error occurred: %s", e, exc_info=True)
            return Response(
                {"error": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
