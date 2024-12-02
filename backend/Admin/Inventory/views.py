import logging
from django.shortcuts import render
from datetime import timedelta
from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import AddProductInventorySerializer, InventorySerializer
from .models import Inventory
from django.db import transaction
from django.utils import timezone

from Admin.Delivery.models import InboundDeliveryDetails, InboundDelivery
from Admin.Delivery.utils import update_inbound_delivery_totals
from Admin.Product.models import Product

logger = logging.getLogger(__name__)


# Create your views here.
class AddProductInventoryView(APIView):
    permission_classes = [permissions.AllowAny]  # Adjust as needed

    def get(self, request, delivery_id):
        # Filter by the given INBOUND_DEL_ID
        inventory_items = Inventory.objects.filter(INBOUND_DEL_ID=delivery_id)
        if not inventory_items.exists():
            return Response(
                {"error": "No records found for the given delivery ID."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Assuming there's only one record per delivery ID for simplicity
        inventory_item = inventory_items.first()
        serializer = AddProductInventorySerializer(inventory_item)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        logger.info("Received request to add product inventory.")

        # Deserialize incoming data
        serializer = AddProductInventorySerializer(data=request.data)

        # Extract status and username from request data
        new_status = request.data.get("status")
        username = request.data.get("user")
        logger.info(f"Received status: {new_status}")

        if serializer.is_valid():
            logger.info("Request data passed validation.")

            # Extract validated data
            inbound_delivery = serializer.validated_data["INBOUND_DEL_ID"]
            details = request.data.get("details", [])

            # Ensure `inbound_delivery` is an ID
            inbound_delivery_id = (
                inbound_delivery.INBOUND_DEL_ID
                if isinstance(inbound_delivery, InboundDelivery)
                else inbound_delivery
            )

            try:
                with transaction.atomic():
                    logger.info(
                        f"Retrieving Inbound Delivery with ID: {inbound_delivery_id}."
                    )
                    inbound_delivery_obj = InboundDelivery.objects.get(
                        pk=inbound_delivery_id
                    )

                    logger.info(
                        f"Processing inventory entries for {len(details)} items."
                    )
                    for detail in details:
                        logger.debug(f"Processing detail: {detail}")

                        # Validate PRICE manually
                        price = detail.get("PRICE")
                        if (
                            price is None
                            or not isinstance(price, (int, float))
                            or price < 0
                        ):
                            error_message = (
                                f"Invalid PRICE for product {detail.get('PRODUCT_ID', 'Unknown')}. "
                                "Must be a non-negative number."
                            )
                            logger.error(error_message)
                            return Response(
                                {"error": error_message},
                                status=status.HTTP_400_BAD_REQUEST,
                            )

                        # Retrieve the Product instance corresponding to PRODUCT_ID
                        try:
                            product = Product.objects.get(pk=detail["PRODUCT_ID"])
                        except Product.DoesNotExist:
                            error_message = (
                                f"Product with ID {detail['PRODUCT_ID']} not found."
                            )
                            logger.error(error_message)
                            return Response(
                                {"error": error_message},
                                status=status.HTTP_404_NOT_FOUND,
                            )

                        # Add inventory entry
                        Inventory.objects.create(
                            INBOUND_DEL_ID_id=inbound_delivery_id,
                            PRODUCT_ID=product,  # Use the Product instance here
                            PRODUCT_NAME=detail["PRODUCT_NAME"],
                            QUANTITY_ON_HAND=detail["QUANTITY_ON_HAND"],
                            EXPIRY_DATE=detail.get("EXPIRY_DATE"),
                        )

                        # Retrieve corresponding InboundDeliveryDetails entry
                        try:
                            delivery_detail = InboundDeliveryDetails.objects.get(
                                INBOUND_DEL_ID=inbound_delivery_id,
                                INBOUND_DEL_DETAIL_PROD_ID=detail["PRODUCT_ID"],
                            )
                        except InboundDeliveryDetails.DoesNotExist:
                            error_message = f"Delivery detail not found for product {detail['PRODUCT_ID']}."
                            logger.error(error_message)
                            return Response(
                                {"error": error_message},
                                status=status.HTTP_404_NOT_FOUND,
                            )

                        # Update delivery detail
                        delivery_detail.INBOUND_DEL_DETAIL_LINE_QTY_ACCEPT = detail[
                            "QUANTITY_ON_HAND"
                        ]
                        delivery_detail.INBOUND_DEL_DETAIL_LINE_PRICE = price
                        delivery_detail.INBOUND_DEL_DETAIL_PROD_EXP_DATE = detail[
                            "EXPIRY_DATE"
                        ]
                        delivery_detail.save()

                    # Update the status of the Inbound Delivery
                    if new_status == "Delivered":
                        logger.info("Updating Inbound Delivery status to 'Delivered'.")
                        inbound_delivery_obj.INBOUND_DEL_STATUS = "Delivered"
                        inbound_delivery_obj.INBOUND_DEL_RCVD_BY_USER_NAME = username
                        inbound_delivery_obj.INBOUND_DEL_DATE_DELIVERED = timezone.now()
                    elif new_status == "Partially Delivered":
                        logger.info(
                            "Updating Inbound Delivery status to 'Partially Delivered'."
                        )
                        inbound_delivery_obj.INBOUND_DEL_STATUS = "Partially Delivered"
                    elif new_status is not None:
                        logger.error(f"Invalid status provided: {new_status}")
                        return Response(
                            {"error": "Invalid status provided."},
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                    inbound_delivery_obj.save()

                    # Update totals
                    logger.info(
                        f"Updating totals for Inbound Delivery with ID: {inbound_delivery_id}."
                    )
                    totals_update_result = update_inbound_delivery_totals(
                        inbound_delivery_id
                    )

                    # Check for errors in totals update
                    if (
                        isinstance(totals_update_result, dict)
                        and "error" in totals_update_result
                    ):
                        error_message = f"Error occurred while updating totals: {totals_update_result['error']}"
                        logger.error(error_message)
                        return Response(
                            {
                                "error": "Failed to update InboundDelivery totals.",
                                "details": totals_update_result["error"],
                            },
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        )

                    logger.info(
                        "Inventory entries, delivery details, and totals updated successfully."
                    )
                    return Response(
                        {
                            "message": "Inventory, delivery details, and totals updated successfully.",
                            "totals": totals_update_result,
                        },
                        status=status.HTTP_201_CREATED,
                    )

            except InboundDelivery.DoesNotExist:
                error_message = (
                    f"Inbound Delivery with ID {inbound_delivery_id} not found."
                )
                logger.error(error_message)
                return Response(
                    {"error": error_message},
                    status=status.HTTP_404_NOT_FOUND,
                )
            except Exception as e:
                logger.exception("An error occurred during processing.")
                return Response(
                    {
                        "error": "Failed to process inventory entries or update details.",
                        "details": str(e),
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        # Log validation errors
        logger.error(f"Validation failed with errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InventoryListView(APIView):
    permission_classes = [permissions.AllowAny]  # Adjust as necessary

    def get(self, request, pk=None):
        # If pk is provided, fetch the specific inventory item
        if pk:
            try:
                inventory_item = Inventory.objects.get(pk=pk)
                serializer = InventorySerializer(inventory_item)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Inventory.DoesNotExist:
                return Response(
                    {"error": "Inventory item not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

        # Otherwise, fetch all inventory records
        inventory_items = Inventory.objects.all()

        # Check if there are no inventory items
        if not inventory_items.exists():
            return Response(
                {"error": "No inventory records found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Serialize the data using the InventorySerializer
        serializer = InventorySerializer(inventory_items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class InventorySearchView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # Extract query parameters
        product_name_query = request.query_params.get("PRODUCT_NAME", None)
        batch_id_query = request.query_params.get("BATCH_ID", None)
        expiry_date_query = request.query_params.get("expiry_date", None)

        # Ensure at least one query parameter is provided
        if not product_name_query and not batch_id_query and not expiry_date_query:
            return Response(
                {
                    "error": "At least one query parameter (product_name, batch_id, expiry_date) must be provided."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Build the filter dynamically based on provided query parameters
        filters = {}
        if product_name_query:
            filters["PRODUCT_NAME__icontains"] = product_name_query
        if batch_id_query:
            filters["BATCH_ID__icontains"] = batch_id_query
        if expiry_date_query:
            filters["EXPIRY_DATE"] = expiry_date_query

        # Query the Inventory model
        inventory_items = Inventory.objects.filter(**filters)

        if not inventory_items.exists():
            return Response(
                {"message": "No inventory items found matching the query."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Serialize the results into a dictionary
        inventory_data = inventory_items.values(
            "INVENTORY_ID",
            "PRODUCT_ID",
            "PRODUCT_NAME",
            "INBOUND_DEL_ID",
            "BATCH_ID",
            "EXPIRY_DATE",
            "QUANTITY_ON_HAND",
            "LAST_UPDATED",
            "DATE_CREATED",
        )

        return Response(inventory_data, status=status.HTTP_200_OK)

class ExpiringProductsView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        today = timezone.now().date()
        one_month_from_today = today + timedelta(days=30)
        
        # Fetch inventory items whose expiry date is between today and 1 month from now
        expiring_inventory = Inventory.objects.filter(
            EXPIRY_DATE__gte=today,
            EXPIRY_DATE__lte=one_month_from_today
        )
        
        # Serialize the inventory items
        serializer = InventorySerializer(expiring_inventory, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)