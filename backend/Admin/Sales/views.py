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

from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime
from django.db import transaction
import logging

# from .utils import recalculate_sales_invoice  # Import the utility function

logger = logging.getLogger(__name__)


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


class ViewPaymentDetails(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, payment_id):
        try:
            payment = CustomerPayment.objects.get(PAYMENT_ID=payment_id)
            serializer = CustomerPaymentListSerializer(payment)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except CustomerPayment.DoesNotExist:
            return Response(
                {"error": "Payment not found."}, status=status.HTTP_404_NOT_FOUND
            )

    def patch(self, request, payment_id):
        try:
            with transaction.atomic():
                # Retrieve the CustomerPayment using the payment_id from the URL
                payment = CustomerPayment.objects.get(PAYMENT_ID=payment_id)
                logger.info(f"Retrieved payment with ID: {payment_id}")

                # Get the amount paid from the request body
                amount = request.data.get("CUSTOMER_AMOUNT_PAID")
                amount = Decimal(amount)
                logger.info(f"Amount received: {amount}")

                # Check and update payment details
                if amount is not None:
                    if amount <= payment.AMOUNT_BALANCE:
                        # Accumulate the amount paid
                        payment.AMOUNT_PAID += amount
                        # Deduct the amount from the balance
                        payment.AMOUNT_BALANCE -= amount

                        logger.info(
                            f"Updated payment: AMOUNT_PAID={payment.AMOUNT_PAID}, AMOUNT_BALANCE={payment.AMOUNT_BALANCE}"
                        )

                        # Round to 2 decimal places before comparing (this ensures precision)
                        # payment.AMOUNT_BALANCE = payment.AMOUNT_BALANCE.quantize(
                        #     Decimal("0.01"), rounding=ROUND_HALF_UP
                        # )

                        # logger.info(f"Rounded AMOUNT_BALANCE: {payment.AMOUNT_BALANCE}")

                        # Check and update the payment status based on the balance
                        if payment.AMOUNT_BALANCE == Decimal("0.00"):
                            payment.PAYMENT_STATUS = "Paid"
                        else:
                            payment.PAYMENT_STATUS = "Partially Paid"

                        logger.info(
                            f"Payment status updated to: {payment.PAYMENT_STATUS}"
                        )
                    else:
                        logger.error("Amount paid exceeds the balance.")
                        return Response(
                            {"error": "Amount paid exceeds the balance."},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                else:
                    logger.error("Amount paid is required.")
                    return Response(
                        {"error": "Amount paid is required."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Save the updated payment
                payment.save()
                logger.info(
                    f"Payment saved with ID: {payment.PAYMENT_ID}, New Status: {payment.PAYMENT_STATUS}"
                )

                # If payment is fully paid, generate a Sales Invoice
                if payment.PAYMENT_STATUS == "Paid":
                    # Create SalesInvoice
                    sales_invoice = SalesInvoice.objects.create(
                        CLIENT=payment.CLIENT_ID,
                        PAYMENT_ID=payment,
                        OUTBOUND_DEL_ID=payment.OUTBOUND_DEL_ID,
                        SALES_INV_TOTAL_PRICE=payment.AMOUNT_PAID,
                        SALES_INV_CREATED_BY=payment.CREATED_BY,
                    )
                    logger.info(
                        f"Sales invoice created with ID: {sales_invoice.SALES_INV_ID}"
                    )

                    # Fetch the Outbound Delivery details
                    outbound_delivery = payment.OUTBOUND_DEL_ID

                    # Assign the discount to the invoice
                    sales_invoice.SALES_INV_DISCOUNT = (
                        outbound_delivery.OUTBOUND_DEL_DISCOUNT
                    )

                    # Save the SalesInvoice with the discount
                    sales_invoice.save()

                    # Loop through each OutboundDeliveryDetails item and create SalesInvoiceItems
                    for item in outbound_delivery.outbound_details.all():
                        # Fetch the product details for the current product in the outbound details
                        product_details = (
                            item.OUTBOUND_DETAILS_PROD_ID.PROD_DETAILS_CODE
                        )

                        # Calculate line gross revenue
                        line_gross_revenue = (
                            item.OUTBOUND_DETAILS_SELL_PRICE
                            * item.OUTBOUND_DETAILS_PROD_QTY_ACCEPTED
                        )

                        # Fetch the purchase price from the ProductDetails model
                        purchase_price = product_details.PROD_DETAILS_PURCHASE_PRICE

                        # Calculate line gross income
                        line_gross_income = (
                            item.OUTBOUND_DETAILS_SELL_PRICE - purchase_price
                        ) * item.OUTBOUND_DETAILS_PROD_QTY_ACCEPTED

                        # Create the SalesInvoiceItems
                        SalesInvoiceItems.objects.create(
                            SALES_INV_ID=sales_invoice,  # Reference to the created SalesInvoice
                            SALES_INV_ITEM_PROD_ID=item.OUTBOUND_DETAILS_PROD_ID,  # Product ID
                            SALES_INV_ITEM_PROD_NAME=item.OUTBOUND_DETAILS_PROD_NAME,  # Product Name
                            SALES_INV_item_PROD_DLVRD=item.OUTBOUND_DETAILS_PROD_QTY_ACCEPTED,  # Quantity Delivered
                            SALES_INV_ITEM_PROD_SELL_PRICE=item.OUTBOUND_DETAILS_SELL_PRICE,  # Selling Price
                            SALES_INV_ITEM_PROD_PURCH_PRICE=purchase_price,  # Purchase Price from ProductDetails
                            SALES_INV_ITEM_LINE_GROSS_REVENUE=line_gross_revenue,  # Gross revenue for the item
                            SALES_INV_ITEM_LINE_GROSS_INCOME=line_gross_income,  # Gross income for the item
                        )
                        logger.info(
                            f"Sales invoice item created for product ID: {item.OUTBOUND_DETAILS_PROD_ID}"
                        )

                # Serialize the updated payment and return the response
                serializer = CustomerPaymentSerializer(payment)
                logger.info(f"Payment serialized with ID: {payment.PAYMENT_ID}")
                return Response(serializer.data, status=status.HTTP_200_OK)

        except CustomerPayment.DoesNotExist:
            logger.error(f"Payment not found with ID: {payment_id}")
            return Response(
                {"error": "Payment not found."}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"An error occurred: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


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
