import logging
from django.shortcuts import render
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import AddProductInventorySerializer, InventorySerializer
from .models import Inventory
from django.db import transaction

from ..Delivery.models import InboundDelivery

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

        # Deserialize incoming data (excluding status)
        serializer = AddProductInventorySerializer(data=request.data)

        # Extract the status directly from the request data
        new_status = request.data.get("status")
        logger.info(f"Received status: {new_status}")

        if serializer.is_valid():
            logger.info("Request data passed validation.")

            # Extract validated data
            inbound_delivery = serializer.validated_data["INBOUND_DEL_ID"]
            details = serializer.validated_data.get("details", [])

            # Ensure `inbound_delivery` contains the ID
            inbound_delivery_id = (
                inbound_delivery.INBOUND_DEL_ID
                if isinstance(inbound_delivery, InboundDelivery)
                else inbound_delivery  # Assume it's already an ID
            )

            try:
                with transaction.atomic():
                    logger.info(
                        f"Retrieving Inbound Delivery with ID: {inbound_delivery_id}."
                    )
                    inbound_delivery_obj = InboundDelivery.objects.get(
                        pk=inbound_delivery_id
                    )

                    logger.info(f"Creating inventory entries for {len(details)} items.")
                    for detail in details:
                        logger.debug(f"Processing detail: {detail}")
                        Inventory.objects.create(
                            INBOUND_DEL_ID_id=inbound_delivery_id,
                            PRODUCT_ID=detail["PRODUCT_ID"],
                            PRODUCT_NAME=detail["PRODUCT_NAME"],
                            QUANTITY_ON_HAND=detail["QUANTITY_ON_HAND"],
                            EXPIRY_DATE=detail.get("EXPIRY_DATE"),
                        )

                    # Update the status of the Inbound Delivery
                    if new_status == "Delivered":
                        logger.info("Updating Inbound Delivery status to 'Delivered'.")
                        inbound_delivery_obj.INBOUND_DEL_STATUS = "Delivered"
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

                logger.info("Inventory entries added and status updated successfully.")
                return Response(
                    {"message": "Inventory added and status updated successfully."},
                    status=status.HTTP_201_CREATED,
                )

            except InboundDelivery.DoesNotExist:
                logger.error(
                    f"Inbound Delivery with ID {inbound_delivery_id} not found."
                )
                return Response(
                    {"error": "Inbound Delivery not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            except Exception as e:
                logger.exception("An error occurred during processing.")
                return Response(
                    {
                        "error": "Failed to create inventory entries or update status.",
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
