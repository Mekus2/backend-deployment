from django.shortcuts import render
from django.db import transaction

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import SalesOrder, SalesOrderDetails
from .serializers import SalesOrderSerializer, SalesOrderDetailsSerializer
from ...Customer.utils import check_customer_exists, add_customer


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
        if customer_data and not check_customer_exists(customer_data):
            add_customer(customer_data)

        if sales_order_serializer.is_valid():
            # Use transaction.atomic() to ensure atomicity
            with transaction.atomic():
                # Save the sales order #
                sales_order = sales_order_serializer.save()  # noqa:F841
            return Response(sales_order_serializer.data, status=status.HTTP_201_CREATED)

        print("Serializer errors:", sales_order_serializer.errors)
        return Response(
            sales_order_serializer.errors, status=status.HTTP_400_BAD_REQUEST
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
