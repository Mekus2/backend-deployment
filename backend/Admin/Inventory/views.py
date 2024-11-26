from django.shortcuts import render
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import AddProductInventorySerializer
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
