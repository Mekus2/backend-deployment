# views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.filters import SearchFilter
from rest_framework.pagination import PageNumberPagination

from .models import SalesInvoice, SalesInvoiceItems, CustomerPayment
from .serializers import (
    CustomerPaymentSerializer,
    CustomerPaymentListSerializer,
    SalesInvoiceSerializer,
    SalesInvoiceItemsSerializer,
)
from django.db import transaction
from django.db.models import Sum, Q, F
from django.utils.dateparse import parse_date

from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, timedelta

import logging

# from .utils import recalculate_sales_invoice  # Import the utility function

logger = logging.getLogger(__name__)


# # Custom pagination class to handle paginated responses
class SalesInvoicePagination(PageNumberPagination):
    page_size = 10  # You can set your own page size or get it from query parameters
    page_size_query_param = "page_size"
    max_page_size = 100


# # Create a view to list sales invoices with search and pagination
# class SalesInvoiceListView(generics.ListAPIView):
#     permission_classes = [permissions.AllowAny]
#     queryset = SalesInvoice.objects.all().order_by("-SALES_INV_CREATED_AT")
#     serializer_class = SalesInvoiceSerializer
#     pagination_class = SalesInvoicePagination
#     filter_backends = [SearchFilter]
#     search_fields = [
#         "SALES_INV_ID",
#         "CLIENT_NAME",
#         "SALES_INV_PYMNT_STATUS",
#     ]  # Define fields you want to allow searching on

#     def get_queryset(self):
#         """
#         Optionally restricts the returned sales invoices,
#         by filtering against a `search` query parameter in the URL.
#         """
#         queryset = super().get_queryset()
#         search_term = self.request.query_params.get("search", None)

#         if search_term:
#             queryset = queryset.filter(SALES_INV_ID__icontains=search_term)

#         return queryset


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

    # Retrieve the payment details
    def get(self, request, payment_id):
        try:
            payment = CustomerPayment.objects.get(PAYMENT_ID=payment_id)
            serializer = CustomerPaymentListSerializer(payment)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except CustomerPayment.DoesNotExist:
            return Response(
                {"error": "Payment not found."}, status=status.HTTP_404_NOT_FOUND
            )

    # Update the payment details and generate a sales invoice if fully paid
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
                        payment.AMOUNT_BALANCE = payment.AMOUNT_BALANCE.quantize(
                            Decimal("0.01"), rounding=ROUND_HALF_UP
                        )

                        logger.info(f"Rounded AMOUNT_BALANCE: {payment.AMOUNT_BALANCE}")

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

                    # Initialize total gross revenue and total gross income
                    total_gross_revenue = Decimal("0.00")
                    total_gross_income = Decimal("0.00")

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

                        # Add to the total gross revenue and gross income
                        total_gross_revenue += line_gross_revenue
                        total_gross_income += line_gross_income

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

                    # Update the total gross revenue and gross income in the sales_invoice
                    sales_invoice.SALES_INV_TOTAL_GROSS_REVENUE = total_gross_revenue
                    sales_invoice.SALES_INV_TOTAL_GROSS_INCOME = total_gross_income

                    # Save the updated sales_invoice
                    sales_invoice.save()

                    logger.info(
                        f"Sales invoice totals updated: GROSS_REVENUE={total_gross_revenue}, GROSS_INCOME={total_gross_income}"
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


class SalesInvoicePagination(PageNumberPagination):
    page_size = 10  # Set the number of items per page
    page_size_query_param = "page_size"  # Allow overriding via query parameter


class SalesInvoiceListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # Extract search term and date filters
        search_term = request.query_params.get("search", "")
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        # Default to current month if no date range is provided
        if not start_date or not end_date:
            today = datetime.today()
            start_date = today.replace(day=1)  # First day of the current month
            end_date = today + timedelta(
                days=(31 - today.day)
            )  # Last day of the current month

        # Filter sales invoices based on search term and date range
        sales_invoices = SalesInvoice.objects.filter(
            Q(SALES_INV_ID__icontains=search_term)
            | Q(CLIENT__name__icontains=search_term)
            | Q(CLIENT__address__icontains=search_term)
            | Q(CLIENT__province__icontains=search_term),
            SALES_INV_DATETIME__range=(start_date, end_date),
        ).order_by("-SALES_INV_DATETIME")

        # Calculate the sum of gross income and revenue for the filtered invoices
        total_gross_income = (
            sales_invoices.aggregate(total_income=Sum("SALES_INV_TOTAL_GROSS_INCOME"))[
                "total_income"
            ]
            or 0
        )

        total_gross_revenue = (
            sales_invoices.aggregate(
                total_revenue=Sum("SALES_INV_TOTAL_GROSS_REVENUE")
            )["total_revenue"]
            or 0
        )

        # Paginate results
        paginator = SalesInvoicePagination()
        paginated_sales_invoices = paginator.paginate_queryset(sales_invoices, request)

        # Serialize the results
        serializer = SalesInvoiceSerializer(paginated_sales_invoices, many=True)

        # Include totals in the response
        response_data = {
            "total_gross_income": total_gross_income,
            "total_gross_revenue": total_gross_revenue,
            "sales_invoices": serializer.data,
        }

        # Return paginated response with totals
        return paginator.get_paginated_response(response_data)


class SalesInvoiceDetailsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, sales_inv_id):
        try:
            # Retrieve the sales invoice using the sales_inv_id from the URL
            sales_invoice = SalesInvoice.objects.get(SALES_INV_ID=sales_inv_id)

            # Retrieve related SalesInvoiceItems
            invoice_items = SalesInvoiceItems.objects.filter(SALES_INV_ID=sales_invoice)

            # Debugging: print the invoice_items to ensure it's a queryset
            print(invoice_items)  # This should be a queryset, not a list

            # Serialize the sales invoice and its related items
            items_serializer = SalesInvoiceItemsSerializer(invoice_items, many=True)

            # Return both sales invoice and its items as serialized data
            return Response(
                {"items": items_serializer.data},
                status=status.HTTP_200_OK,
            )

        except SalesInvoice.DoesNotExist:
            return Response(
                {"error": "Sales invoice not found."}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
