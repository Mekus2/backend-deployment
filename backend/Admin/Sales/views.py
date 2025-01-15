# views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.filters import SearchFilter
from rest_framework.pagination import PageNumberPagination

from .models import SalesInvoice, SalesInvoiceItems, CustomerPayment
from .serializers import (
    SalesInvoiceSerializer,
    CustomerPaymentSerializer,
    CustomerPaymentListSerializer,
)
from django.db.models import Sum, Q, F

from decimal import Decimal
from datetime import datetime
from django.db import transaction
from .utils import recalculate_sales_invoice  # Import the utility function


# Custom pagination class to handle paginated responses
class SalesInvoicePagination(PageNumberPagination):
    page_size = 10  # You can set your own page size or get it from query parameters
    page_size_query_param = "page_size"
    max_page_size = 100


# Create a view to list sales invoices with search and pagination
class SalesInvoiceListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = SalesInvoice.objects.all().order_by("-SALES_INV_CREATED_AT")
    serializer_class = SalesInvoiceSerializer
    pagination_class = SalesInvoicePagination
    filter_backends = [SearchFilter]
    search_fields = [
        "SALES_INV_ID",
        "CLIENT_NAME",
        "SALES_INV_PYMNT_STATUS",
    ]  # Define fields you want to allow searching on

    def get_queryset(self):
        """
        Optionally restricts the returned sales invoices,
        by filtering against a `search` query parameter in the URL.
        """
        queryset = super().get_queryset()
        search_term = self.request.query_params.get("search", None)

        if search_term:
            queryset = queryset.filter(SALES_INV_ID__icontains=search_term)

        return queryset


class CustomerPayableListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = CustomerPayment.objects.all().order_by("-PAYMENT_ID")
    serializer_class = CustomerPaymentListSerializer
    pagination_class = SalesInvoicePagination
    filter_backends = [SearchFilter]
    search_fields = [
        "PAYMENT_ID",
        "CLIENT_NAME",
        "PAYMENT_STATUS",
    ]  # Define fields you want to allow searching on

    def get_queryset(self):
        """
        Optionally restricts the returned customer payments,
        by filtering against a `search` query parameter in the URL.
        """
        queryset = super().get_queryset()
        search_term = self.request.query_params.get("search", None)

        if search_term:
            queryset = queryset.filter(
                Q(PAYMENT_ID__icontains=search_term)
                | Q(CLIENT_NAME__icontains=search_term)
                | Q(PAYMENT_STATUS__icontains=search_term)
            )

        return queryset


class AddPaymentView(APIView):
    permission_classes = [permissions.AllowAny]

    def patch(self, request, payment_id):
        try:
            with transaction.atomic():
                # Retrieve the sales invoice using the invoice_id from the URL
                paymentId = CustomerPayment.objects.get(PAYMENT_ID=payment_id)

                # Get the data from the request body
                amount = request.data.get("SALES_INV_AMOUNT_PAID")

                amount = Decimal(amount)

                # Stack the amount if provided
                if amount is not None:
                    paymentId.AMOUNT_PAID += amount  # Accumulate the amount

                # Save the updated invoice
                paymentId.save()

                # Serialize the updated invoice and return the response
                serializer = CustomerPaymentSerializer(paymentId)
                return Response(serializer.data, status=status.HTTP_200_OK)

        except CustomerPayment.DoesNotExist:
            return Response(
                {"error": "Invoice not found."}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class SalesReportPagination(PageNumberPagination):
    page_size = 20  # Set default page size to 20
    page_size_query_param = "page_size"
    max_page_size = 100  # Max limit for page size


class SalesReportView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        search_term_type = request.GET.get("search_term_type", None)
        search_term = request.GET.get("search_term", None)
        page = request.GET.get("page", 1)  # noqa:F841

        # Handle search filters
        if search_term_type == "customer" and search_term:
            invoices = SalesInvoice.objects.filter(CLIENT_NAME__icontains=search_term)
        elif search_term_type == "date" and search_term:
            # Ensure date is in the correct format (YYYY-MM-DD)
            try:
                search_date = datetime.strptime(search_term, "%Y-%m-%d").date()
                invoices = SalesInvoice.objects.filter(
                    SALES_INV_DATETIME__date=search_date
                )
            except ValueError:
                return Response(
                    {"error": "Invalid date format. Please use YYYY-MM-DD."}, status=400
                )
        elif search_term_type == "city" and search_term:
            invoices = SalesInvoice.objects.filter(CLIENT_CITY__icontains=search_term)
        elif search_term_type == "province" and search_term:
            invoices = SalesInvoice.objects.filter(
                CLIENT_PROVINCE__icontains=search_term
            )
        else:
            # If no search term or term type, return all invoices (or apply some other default behavior)
            invoices = SalesInvoice.objects.all()

        # Pagination
        paginator = PageNumberPagination()
        paginator.page_size = 20
        result_page = paginator.paginate_queryset(invoices, request)

        # Serialize the result
        serializer = SalesInvoiceSerializer(result_page, many=True)

        # Return the paginated response with serialized data
        return paginator.get_paginated_response(serializer.data)
