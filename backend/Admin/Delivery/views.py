from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import (
    OutboundDelivery,
    OutboundDeliveryDetails,
    InboundDelivery,
    InboundDeliveryDetails,
)
from .serializers import (
    OutboundDeliverySerializer,
    OutboundDeliveryDetailsSerializer,
    InboundDeliverySerializer,
    InboundDeliveryDetailsSerializer,
    UpdateInboundDeliveryDetailsSerializer,
    UpdateInboundDeliverySerializer,
    CreateInboundDeliverySerializer,
    CreateInboundDeliveryDetailsSerializer,
    CreateOutboundDeliveryDetailsSerializer,
    CreateOutboundDeliverySerializer,
    UpdateInboundStatus,
)
from datetime import datetime
from django.utils import timezone
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.http import Http404
from Admin.Inventory.models import Inventory
from Admin.Sales.models import SalesInvoice, SalesInvoiceItems
from Admin.Product.models import Product, ProductDetails


import logging

logger = logging.getLogger(__name__)


class OutboundDeliveryListCreateAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        """List all Outbound Deliveries."""
        queryset = OutboundDelivery.objects.all()
        serializer = OutboundDeliverySerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Create a new Outbound Delivery with associated details."""
        data = request.data
        details_data = data.pop("details", [])  # Extract nested details data

        # Validate and create the outbound delivery
        delivery_serializer = CreateOutboundDeliverySerializer(data=data)
        if delivery_serializer.is_valid():
            with transaction.atomic():
                # Save the parent delivery
                outbound_delivery = delivery_serializer.save()

                # Validate and save the associated details
                for detail in details_data:
                    # Update the status of the related Sales(Customer) Order
                    sales_order = outbound_delivery.SALES_ORDER_ID
                    if sales_order:
                        sales_order.SALES_ORDER_STATUS = "Accepted"
                        sales_order.save()

                    detail["OUTBOUND_DEL_ID"] = outbound_delivery.OUTBOUND_DEL_ID
                    detail_serializer = CreateOutboundDeliveryDetailsSerializer(
                        data=detail
                    )
                    if detail_serializer.is_valid():
                        detail_serializer.save()
                    else:
                        # If any detail fails validation, rollback the transaction
                        return Response(
                            {
                                "error": "Invalid details data",
                                "details_errors": detail_serializer.errors,
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )

            # Return the created delivery along with its details
            return Response(delivery_serializer.data, status=status.HTTP_201_CREATED)

        return Response(delivery_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GetTotalOutboundPendingCount(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            pending_count = OutboundDelivery.objects.filter(
                OUTBOUND_DEL_STATUS="Pending"
            ).count()

            return Response({"pending_total": pending_count}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class OutboundDeliveryDetailsAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        """Retrieve specific Outbound Delivery details."""
        details = OutboundDeliveryDetails.objects.filter(OUTBOUND_DEL_ID=pk)
        if not details.exists():
            return Response(
                {"error": "Outbound Delivery details not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = OutboundDeliveryDetailsSerializer(details, many=True)
        return Response(serializer.data)

    def delete(self, request, pk):
        """Delete specific Outbound Delivery details."""
        details = OutboundDeliveryDetails.objects.filter(OUTBOUND_DEL_ID=pk)
        if not details.exists():
            return Response(
                {"error": "Outbound Delivery details not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        details.delete()
        return Response(
            {"message": "Outbound Delivery details deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )


class DeductProductInventory(APIView):
    permission_classes = [permissions.AllowAny]


class AcceptOutboundDeliveryAPI(APIView):
    permission_classes = [permissions.AllowAny]

    def patch(self, request, pk):
        try:
            # Start a transaction to ensure atomicity
            with transaction.atomic():
                # Fetch the OutboundDelivery by pk
                logger.debug(f"Attempting to fetch OutboundDelivery with pk: {pk}")
                outbound_delivery = get_object_or_404(OutboundDelivery, pk=pk)
                logger.info(f"Fetched OutboundDelivery: {outbound_delivery}")

                # Get the status from the request data
                new_status = request.data.get("status")
                if not new_status:
                    logger.warning("Status is missing in the request data.")
                    return Response(
                        {"error": "Status must be provided."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                logger.debug(f"New status received: {new_status}")

                if new_status == "Dispatched":
                    if outbound_delivery.OUTBOUND_DEL_STATUS == "Pending":
                        logger.info("Processing status transition to 'Dispatched'.")

                        # Deduct inventory for all products in the delivery
                        outbound_delivery_details = (
                            outbound_delivery.outbound_details.all()
                        )
                        logger.debug(
                            f"OutboundDeliveryDetails count: {len(outbound_delivery_details)}"
                        )

                        for detail in outbound_delivery_details:
                            product_id = detail.OUTBOUND_DETAILS_PROD_ID
                            quantity_to_deduct = (
                                detail.OUTBOUND_DETAILS_PROD_QTY_ORDERED
                            )
                            logger.error(f"Product ID: {product_id}")

                            if not product_id:
                                logger.error(
                                    f"Missing product ID for delivery detail ID {detail.OUTBOUND_DEL_DETAIL_ID}."
                                )
                                return Response(
                                    {
                                        "error": f"Product not found for delivery detail ID {detail.OUTBOUND_DEL_DETAIL_ID}."
                                    },
                                    status=status.HTTP_400_BAD_REQUEST,
                                )

                            if quantity_to_deduct <= 0:
                                logger.error(
                                    f"Invalid quantity to deduct for product {product_id}. Must be greater than zero."
                                )
                                return Response(
                                    {
                                        "error": f"Invalid quantity to deduct for product {product_id}. Must be greater than zero."
                                    },
                                    status=status.HTTP_400_BAD_REQUEST,
                                )

                            # Fetch inventory batches for the product
                            inventory_batches = Inventory.objects.filter(
                                PRODUCT_ID=product_id
                            ).order_by("EXPIRY_DATE")
                            logger.debug(
                                f"Fetched {len(inventory_batches)} inventory batches for product ID {product_id}."
                            )
                            logger.error(
                                f"Inventory batches for product {product_id}: {list(inventory_batches)}"
                            )

                            if not inventory_batches.exists():
                                logger.error(
                                    f"No inventory available for product {product_id}."
                                )
                                return Response(
                                    {
                                        "error": f"No inventory available for product {product_id}."
                                    },
                                    status=status.HTTP_400_BAD_REQUEST,
                                )

                            total_deducted = 0

                            for batch in inventory_batches:
                                if total_deducted >= quantity_to_deduct:
                                    break

                                deduct_from_batch = min(
                                    batch.QUANTITY_ON_HAND,
                                    quantity_to_deduct - total_deducted,
                                )
                                batch.QUANTITY_ON_HAND -= deduct_from_batch
                                total_deducted += deduct_from_batch
                                batch.save()

                                logger.info(
                                    f"Deducted {deduct_from_batch} from batch {batch.BATCH_ID} "
                                    f"for product {batch.PRODUCT_NAME}. Remaining in batch: {batch.QUANTITY_ON_HAND}"
                                )

                            if total_deducted < quantity_to_deduct:
                                logger.error(
                                    f"Insufficient inventory for product {product_id}. "
                                    f"Needed: {quantity_to_deduct}, Available: {total_deducted}."
                                )
                                return Response(
                                    {
                                        "error": f"Insufficient inventory for product {product_id}. "
                                        f"Needed: {quantity_to_deduct}, Available: {total_deducted}."
                                    },
                                    status=status.HTTP_400_BAD_REQUEST,
                                )

                        # Update the delivery status
                        outbound_delivery.OUTBOUND_DEL_STATUS = "Dispatched"
                        outbound_delivery.OUTBOUND_DEL_SHIPPED_DATE = timezone.now()
                        outbound_delivery.save()
                        logger.info(
                            f"Outbound Delivery {outbound_delivery.pk} marked as Dispatched."
                        )

                        # Fetch and update the connected SalesOrder
                        sales_order = (
                            outbound_delivery.SALES_ORDER_ID
                        )  # Access the related SalesOrder
                        sales_order.SALES_ORDER_STATUS = "Completed"
                        sales_order.save()
                        logger.info(
                            f"Sales Order {sales_order.SALES_ORDER_ID} marked as Completed."
                        )

                        return Response(
                            {
                                "message": "Outbound Delivery marked as Dispatched, inventory updated, and SalesOrder marked as Completed."
                            },
                            status=status.HTTP_200_OK,
                        )
                    else:
                        logger.warning("Invalid status transition to 'Dispatched'.")
                        return Response(
                            {"error": "Invalid status transition."},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                else:
                    logger.error(f"Invalid status provided: {new_status}")
                    return Response(
                        {"error": "Invalid status provided."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

        except Http404 as e:
            logger.error(f"Http404 error: {str(e)}")
            return Response(
                {"error": f"Resource not found: {str(e)}"},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:
            logger.exception("Unexpected error occurred.")
            return Response(
                {"error": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CompleteOutboundDeliveryAPI(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        try:
            # Start a transaction to ensure atomicity
            with transaction.atomic():
                # Fetch the OutboundDelivery by pk
                logger.debug(f"Attempting to fetch OutboundDelivery with pk: {pk}")
                outbound_delivery = get_object_or_404(OutboundDelivery, pk=pk)
                logger.info(f"Fetched OutboundDelivery: {outbound_delivery}")

                # Ensure the current status is "Dispatched"
                if outbound_delivery.OUTBOUND_DEL_STATUS != "Dispatched":
                    logger.warning(
                        "Only deliveries with status 'Dispatched' can be completed."
                    )
                    return Response(
                        {
                            "error": "Invalid status transition. Delivery must be 'Dispatched' to mark as 'Delivered'."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Parse request data
                items = request.data.get("items", [])
                if not items:
                    logger.error("Request body missing 'items'.")
                    return Response(
                        {"error": "Request must include 'items' data."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Update the delivery details with accepted and defect quantities
                for item in items:
                    detail_id = item.get("prod_details_id")
                    qty_accepted = item.get("qtyAccepted", 0)
                    qty_defect = item.get("qtyDefect", 0)

                    try:
                        detail = OutboundDeliveryDetails.objects.get(
                            OUTBOUND_DEL_DETAIL_ID=detail_id
                        )
                        detail.OUTBOUND_DETAILS_PROD_QTY_ACCEPTED = qty_accepted
                        detail.OUTBOUND_DETAILS_PROD_QTY_DEFECT = qty_defect
                        detail.save()

                        logger.info(
                            f"Updated delivery detail {detail_id}: "
                            f"Accepted: {qty_accepted}, Defective: {qty_defect}"
                        )
                    except OutboundDeliveryDetails.DoesNotExist:
                        logger.error(f"Delivery detail with ID {detail_id} not found.")
                        return Response(
                            {
                                "error": f"Delivery detail with ID {detail_id} not found."
                            },
                            status=status.HTTP_404_NOT_FOUND,
                        )

                # Update the delivery status to "Delivered"
                outbound_delivery.OUTBOUND_DEL_STATUS = "Delivered"
                outbound_delivery.OUTBOUND_DEL_CSTMR_RCVD_DATE = timezone.now()
                outbound_delivery.save()
                logger.info(
                    f"Outbound Delivery {outbound_delivery.pk} marked as Delivered."
                )

                # Create a Sales Invoice for the completed Outbound Delivery
                sales_invoice = SalesInvoice(
                    SALES_INV_DATETIME=outbound_delivery.OUTBOUND_DEL_CREATED,
                    SALES_INV_TOTAL_PRICE=outbound_delivery.OUTBOUND_DEL_TOTAL_PRICE,
                    SALES_ORDER_DLVRY_OPTION=outbound_delivery.OUTBOUND_DEL_DLVRY_OPTION,
                    CLIENT_ID=outbound_delivery.CLIENT_ID,
                    CLIENT_NAME=outbound_delivery.OUTBOUND_DEL_CUSTOMER_NAME,
                    CLIENT_PROVINCE=outbound_delivery.OUTBOUND_DEL_PROVINCE,
                    CLIENT_CITY=outbound_delivery.OUTBOUND_DEL_CITY,
                    SALES_INV_PYMNT_METHOD="Cash",
                    OUTBOUND_DEL_ID=outbound_delivery,
                )

                for detail in outbound_delivery.outbound_details.all():
                    product = detail.OUTBOUND_DETAILS_PROD_ID
                    product_details = product.PROD_DETAILS_CODE

                    # Create a SalesInvoiceItems record
                    SalesInvoiceItems.objects.create(
                        SALES_INV_ID=sales_invoice,
                        SALES_INV_ITEM_PROD_ID=product,
                        SALES_INV_ITEM_PROD_NAME=detail.OUTBOUND_DETAILS_PROD_NAME,
                        SALES_INV_item_PROD_DLVRD=detail.OUTBOUND_DETAILS_PROD_QTY_ACCEPTED,
                        SALES_INV_ITEM_PROD_SELL_PRICE=detail.OUTBOUND_DETAILS_SELL_PRICE,
                        SALES_INV_ITEM_PROD_PURCH_PRICE=product_details.PROD_DETAILS_PURCHASE_PRICE,
                        SALES_INV_ITEM_LINE_GROSS_REVENUE=detail.OUTBOUND_DETAILS_SELL_PRICE
                        * detail.OUTBOUND_DETAILS_PROD_QTY_ACCEPTED,
                        SALES_INV_ITEM_LINE_GROSS_INCOME=(
                            detail.OUTBOUND_DETAILS_SELL_PRICE
                            - product_details.PROD_DETAILS_PRICE
                        )
                        * detail.OUTBOUND_DETAILS_PROD_QTY_ACCEPTED,
                    )
                sales_invoice.calculate_totals()
                sales_invoice.save()

                # Return success response
                return Response(
                    {
                        "message": "Outbound Delivery marked as Delivered, delivery details updated, and Sales Invoice created."
                    },
                    status=status.HTTP_200_OK,
                )

        except Http404 as e:
            logger.error(f"Http404 error: {str(e)}")
            return Response(
                {"error": f"Resource not found: {str(e)}"},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:
            logger.exception("Unexpected error occurred.")
            return Response(
                {"error": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GetTotalInboundPendingCount(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            pending_count = InboundDelivery.objects.filter(
                INBOUND_DEL_STATUS="Pending"
            ).count()
            return Response({"pending_count": pending_count}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class InboundDeliveryPagination(PageNumberPagination):
    """
    Custom pagination class for Inbound Deliveries.
    """

    page_size = 10  # Number of records per page
    page_size_query_param = "page_size"
    max_page_size = 100


class InboundDeliveryListCreateAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # """List all Inbound Deliveries."""
        queryset = InboundDelivery.objects.all()
        serializer = InboundDeliverySerializer(queryset, many=True)
        return Response(serializer.data)

        # queryset = InboundDelivery.objects.all()
        # paginator = InboundDeliveryPagination()
        # paginated_queryset = paginator.paginate_queryset(queryset, request)
        # serializer = InboundDeliverySerializer(paginated_queryset, many=True)
        # return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        """Create a new Inbound Delivery with details."""
        print("Incoming Data:", request.data)

        # Extract inbound delivery data and associated details
        inbound_delivery_data = request.data.copy()
        details_data = inbound_delivery_data.pop("details", [])

        # Validate and save inbound delivery data
        serializer = CreateInboundDeliverySerializer(data=inbound_delivery_data)
        if serializer.is_valid():
            with transaction.atomic():
                # Save the inbound delivery
                inbound_delivery = serializer.save()

                # Validate and save the details
                detail_errors = []
                for detail in details_data:
                    # Update the status of the related Purchase Order
                    purchase_order = inbound_delivery.PURCHASE_ORDER_ID
                    if purchase_order:
                        purchase_order.PURCHASE_ORDER_STATUS = (
                            "Accepted"  # Update the status
                        )
                        purchase_order.save()

                    # Attach the INBOUND_DEL_ID to each detail
                    detail["INBOUND_DEL_ID"] = inbound_delivery.INBOUND_DEL_ID
                    detail_serializer = CreateInboundDeliveryDetailsSerializer(
                        data=detail
                    )

                    if detail_serializer.is_valid():
                        detail_serializer.save()
                    else:
                        # Collect errors for all invalid details
                        detail_errors.append(detail_serializer.errors)

                if detail_errors:
                    # Rollback if any detail is invalid
                    transaction.set_rollback(True)
                    return Response(
                        {
                            "error": "Some details are invalid.",
                            "details_errors": detail_errors,
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            # Respond with the created inbound delivery data
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        # Respond with errors for the main serializer
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InboundDeliveryRetrieveUpdateAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        # Retrieve a specific inbound delivery
        try:
            delivery = InboundDelivery.objects.get(pk=pk)
        except InboundDelivery.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = InboundDeliverySerializer(delivery)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        """Update an existing Inbound Delivery and its details."""
        try:
            # Fetch the inbound delivery instance
            inbound_delivery = InboundDelivery.objects.get(pk=pk)

            # Extract main delivery data and details data from the request
            inbound_delivery_data = request.data.get("inbound_delivery", {})
            details_data = request.data.get("details", [])

            if not inbound_delivery_data and not details_data:
                return Response(
                    {"error": "No data provided to update."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            with transaction.atomic():
                # Update the InboundDelivery instance
                if inbound_delivery_data:
                    delivery_serializer = UpdateInboundDeliverySerializer(
                        inbound_delivery, data=inbound_delivery_data, partial=True
                    )
                    if delivery_serializer.is_valid():
                        delivery_serializer.save()
                    else:
                        transaction.set_rollback(True)
                        return Response(
                            {"error": delivery_serializer.errors},
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                # Update the InboundDeliveryDetails instances
                for detail in details_data:
                    detail_id = detail.get("id")  # Ensure each detail has an ID
                    if not detail_id:
                        transaction.set_rollback(True)
                        return Response(
                            {"error": "Detail ID is required for updates."},
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                    # Fetch the detail instance and update it
                    try:
                        inbound_detail = InboundDeliveryDetails.objects.get(
                            pk=detail_id
                        )
                    except InboundDeliveryDetails.DoesNotExist:
                        transaction.set_rollback(True)
                        return Response(
                            {"error": f"Detail with ID {detail_id} not found."},
                            status=status.HTTP_404_NOT_FOUND,
                        )

                    detail_serializer = UpdateInboundDeliveryDetailsSerializer(
                        inbound_detail, data=detail, partial=True
                    )
                    if detail_serializer.is_valid():
                        detail_serializer.save()
                    else:
                        transaction.set_rollback(True)
                        return Response(
                            {"error": detail_serializer.errors},
                            status=status.HTTP_400_BAD_REQUEST,
                        )

            return Response(
                {"message": "Inbound Delivery updated successfully."},
                status=status.HTTP_200_OK,
            )

        except InboundDelivery.DoesNotExist:
            return Response(
                {"error": f"Inbound Delivery with ID {pk} not found."},
                status=status.HTTP_404_NOT_FOUND,
            )


class InboundDeliveryDetailsAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        """Retrieve specific Inbound Delivery details."""
        details = InboundDeliveryDetails.objects.filter(INBOUND_DEL_ID=pk)
        if not details.exists():
            return Response(
                {"error": "Inbound Delivery details not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = InboundDeliveryDetailsSerializer(details, many=True)
        return Response(serializer.data)

    def delete(self, request, pk):
        """Delete specific Inbound Delivery details."""
        details = InboundDeliveryDetails.objects.filter(INBOUND_DEL_ID=pk)
        if not details.exists():
            return Response(
                {"error": "Inbound Delivery details not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        details.delete()
        return Response(
            {"message": "Inbound Delivery details deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )


class UpdateInboundDelStatus(APIView):
    permission_classes = [permissions.AllowAny]

    def patch(self, request, pk):
        try:
            # Fetch the InboundDelivery instance
            inbound_delivery = InboundDelivery.objects.get(pk=pk)
        except InboundDelivery.DoesNotExist:
            return Response(
                {"error": "Inbound delivery not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Serialize and validate the incoming data
        serializer = UpdateInboundStatus(
            inbound_delivery, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()  # Save the updated status
            return Response(serializer.data, status=status.HTTP_200_OK)

        # Return validation errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeliveredOutboundDeliveryView(APIView):
    """
    API View to fetch all OutboundDeliveries with status 'Delivered'.
    """

    def get(self, request, *args, **kwargs):
        # Query OutboundDelivery objects with status 'Delivered'
        delivered_deliveries = OutboundDelivery.objects.filter(
            OUTBOUND_DEL_STATUS="Delivered"
        )

        # Serialize the data
        serializer = OutboundDeliverySerializer(delivered_deliveries, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class InboundDeliveryTodayAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, *args, **kwargs):
        # Get the latest date from INBOUND_DEL_ORDER_DATE_CREATED
        latest_date = (
            InboundDelivery.objects.order_by("-INBOUND_DEL_ORDER_DATE_CREATED")
            .values_list("INBOUND_DEL_ORDER_DATE_CREATED__date", flat=True)
            .first()
        )

        if not latest_date:
            return Response({"message": "No data available"}, status=status.HTTP_404_NOT_FOUND)

        # Filter InboundDeliveries by the latest date
        inbound_deliveries_latest = InboundDelivery.objects.filter(
            INBOUND_DEL_ORDER_DATE_CREATED__date=latest_date
        )

        # Serialize the data
        serializer = InboundDeliverySerializer(inbound_deliveries_latest, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

class InboundDeliveryDateRangeAPIView(APIView):
    permission_classes = [permissions.AllowAny] 
    
    def get(self, request, *args, **kwargs):
        # Get the 'start_date' and 'end_date' from the request query parameters
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        # Validate the provided dates
        if not start_date or not end_date:
            return Response({"message": "Both start_date and end_date are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Convert string dates to date objects
            start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
            end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
        except ValueError:
            return Response({"message": "Invalid date format. Please use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        # Filter InboundDeliveries by the date range
        inbound_deliveries = InboundDelivery.objects.filter(
            INBOUND_DEL_ORDER_DATE_CREATED__date__range=[start_date, end_date]
        )

        if not inbound_deliveries:
            return Response({"message": "No data found for the given date range."}, status=status.HTTP_404_NOT_FOUND)

        # Serialize the data
        serializer = InboundDeliverySerializer(inbound_deliveries, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


#FOR OUTBOUND DELIVERY REPORT
class OutboundDeliveryTodayAPIView(APIView):
    permission_classes = [permissions.AllowAny]  # Modify permissions as needed
    
    def get(self, request, *args, **kwargs):
        # Get the latest date from OUTBOUND_DEL_CREATED
        latest_date = (
            OutboundDelivery.objects.order_by("-OUTBOUND_DEL_CREATED")
            .values_list("OUTBOUND_DEL_CREATED__date", flat=True)
            .first()
        )

        if not latest_date:
            return Response({"message": "No data available"}, status=status.HTTP_404_NOT_FOUND)

        # Filter OutboundDeliveries by the latest date
        outbound_deliveries_latest = OutboundDelivery.objects.filter(
            OUTBOUND_DEL_CREATED__date=latest_date
        )

        # Serialize the data
        serializer = OutboundDeliverySerializer(outbound_deliveries_latest, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

class OutboundDeliveryDateRangeAPIView(APIView):
    permission_classes = [permissions.AllowAny]  # Modify permissions as needed

    def get(self, request, *args, **kwargs):
        # Get the 'start_date' and 'end_date' from the request query parameters
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        # Validate the provided dates
        if not start_date or not end_date:
            return Response({"message": "Both start_date and end_date are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Convert string dates to date objects
            start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
            end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
        except ValueError:
            return Response({"message": "Invalid date format. Please use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        # Filter OutboundDeliveries by the date range
        outbound_deliveries = OutboundDelivery.objects.filter(
            OUTBOUND_DEL_CREATED__date__range=[start_date, end_date]
        )

        if not outbound_deliveries:
            return Response({"message": "No data found for the given date range."}, status=status.HTTP_404_NOT_FOUND)

        # Serialize the data
        serializer = OutboundDeliverySerializer(outbound_deliveries, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)