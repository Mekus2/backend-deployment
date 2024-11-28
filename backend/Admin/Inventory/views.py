from django.shortcuts import render
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import AddProductInventorySerializer, InventorySerializer
from .models import Inventory
from django.db import transaction

from ..Delivery.models import InboundDelivery


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
        # Deserialize incoming data
        serializer = AddProductInventorySerializer(data=request.data)

        if serializer.is_valid():
            # Extract validated data
            inbound_delivery = serializer.validated_data["INBOUND_DEL_ID"]
            details = serializer.validated_data.get("details", [])

            # Ensure `inbound_delivery_id` contains the ID
            if isinstance(inbound_delivery, InboundDelivery):
                inbound_delivery_id = (
                    inbound_delivery.INBOUND_DEL_ID
                )  # Extract the ID from the object
            else:
                inbound_delivery_id = inbound_delivery  # Assuming it's already an ID

            # Use a transaction.atomic() block to ensure rollback on error
            try:
                with transaction.atomic():
                    # List to hold created inventory entries
                    inventory_items = []

                    # Loop through details to create inventory entries
                    for detail in details:
                        inventory_entry = Inventory.objects.create(
                            INBOUND_DEL_ID_id=inbound_delivery_id,  # Pass the ID directly
                            PRODUCT_ID=detail["PRODUCT_ID"],
                            PRODUCT_NAME=detail["PRODUCT_NAME"],
                            QUANTITY_ON_HAND=detail["QUANTITY_ON_HAND"],
                            EXPIRY_DATE=detail.get("EXPIRY_DATE"),
                        )
                        inventory_items.append(inventory_entry)

                    # Construct the response data
                    response_data = {
                        "INBOUND_DEL_ID": inbound_delivery_id,  # Return the ID instead of the object
                        "details": [
                            {
                                "PRODUCT_ID": (
                                    item.PRODUCT_ID.id if item.PRODUCT_ID else None
                                ),  # Use the ID of the related Product
                                "PRODUCT_NAME": item.PRODUCT_NAME,
                                "QUANTITY_ON_HAND": item.QUANTITY_ON_HAND,
                                "EXPIRY_DATE": item.EXPIRY_DATE,
                            }
                            for item in inventory_items
                        ],
                    }

                # If everything is successful, return the response
                return Response(response_data, status=status.HTTP_201_CREATED)

            except Exception as e:
                # In case of any error, the transaction will be rolled back
                return Response(
                    {
                        "error": "Failed to create inventory entries.",
                        "details": str(e),
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        # Return validation errors if serializer is invalid
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
                    status=status.HTTP_404_NOT_FOUND
                )

        # Otherwise, fetch all inventory records
        inventory_items = Inventory.objects.all()
        
        # Check if there are no inventory items
        if not inventory_items.exists():
            return Response(
                {"error": "No inventory records found."},
                status=status.HTTP_404_NOT_FOUND
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
                {"error": "At least one query parameter (product_name, batch_id, expiry_date) must be provided."},
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