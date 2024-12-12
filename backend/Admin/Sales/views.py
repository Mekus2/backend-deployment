# views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.filters import SearchFilter
from rest_framework.pagination import PageNumberPagination

from .models import SalesInvoice, SalesInvoiceItems
from .serializers import SalesInvoiceSerializer
from django.db.models import Sum, Q, F

from decimal import Decimal
from datetime import datetime
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

        # Call the recalculation function for each invoice as needed
        # Ideally, these should be done based on specific triggers (e.g., an invoice is updated)
        recalculate_sales_invoice("INV001")
        recalculate_sales_invoice("INV002")

        return queryset


class AddPaymentandTerms(APIView):
    permission_classes = [permissions.AllowAny]

    def patch(self, request, invoice_id):
        try:
            # Retrieve the sales invoice using the invoice_id from the URL
            invoice = SalesInvoice.objects.get(SALES_INV_ID=invoice_id)

            # Get the data from the request body
            terms = request.data.get("SALES_INV_PYMNT_TERMS")
            amount = request.data.get("SALES_INV_AMOUNT_PAID")

            amount = Decimal(amount)
            # Update the terms if provided
            if terms is not None:
                invoice.SALES_INV_PYMNT_TERMS = terms

            # Stack the amount if provided
            if amount is not None:
                invoice.SALES_INV_AMOUNT_PAID += amount  # Accumulate the amount

            # Save the updated invoice
            invoice.save()

            # Serialize the updated invoice and return the response
            serializer = SalesInvoiceSerializer(invoice)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except SalesInvoice.DoesNotExist:
            return Response(
                {"error": "Invoice not found."}, status=status.HTTP_404_NOT_FOUND
            )


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
