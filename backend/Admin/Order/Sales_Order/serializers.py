from rest_framework import serializers
from django.db import transaction
from .models import SalesOrder, SalesOrderDetails, Clients


class SalesOrderDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesOrderDetails
        fields = [
            "SALES_ORDER_DET_ID",
            "SALES_ORDER_ID",
            "SALES_ORDER_PROD_ID",
            "SALES_ORDER_PROD_NAME",
            "SALES_ORDER_LINE_PRICE",
            "SALES_ORDER_LINE_QTY",
            "SALES_ORDER_LINE_DISCOUNT",
            "SALES_ORDER_LINE_TOTAL",
        ]
        extra_kwargs = {
            "SALES_ORDER_ID": {"required": False}
            # SALES_ORDER_ID will be auto-populated, not provided by the user
        }


class SalesOrderSerializer(serializers.ModelSerializer):
    # Nested serializer for handling details
    details = SalesOrderDetailsSerializer(many=True, required=False)
    CLIENT_ID = serializers.PrimaryKeyRelatedField(queryset=Clients.objects.all())

    class Meta:
        model = SalesOrder
        fields = [
            "SALES_ORDER_ID",
            "SALES_ORDER_DATE_CREATED",
            "SALES_ORDER_STATUS",
            "SALES_ORDER_CREATEDBY_USER",
            "SALES_ORDER_CLIENT_NAME",
            "SALES_ORDER_CLIENT_PROVINCE",
            "SALES_ORDER_CLIENT_CITY",
            "SALES_ORDER_CLIENT_PHONE_NUM",
            "SALES_ORDER_DLVRY_OPTION",
            "SALES_ORDER_PYMNT_OPTION",
            "SALES_ORDER_TOTAL_QTY",
            "SALES_ORDER_TOTAL_PRICE",
            "SALES_ORDER_TOTAL_DISCOUNT",
            "CLIENT_ID",
            "details",
        ]

    def validate(self, data):
        # Retrieve details data directly from the input
        details = data.get("details", [])  # Get the details list
        print("Details received for validation:", details)

        # Extract CLIENT_ID directly from the main order data
        client_id = data.get("CLIENT_ID")
        print(f"Received CLIENT_ID: {client_id}")

        # Ensure at least one SalesOrderDetail is provided
        if not details:
            raise serializers.ValidationError(
                {"details": "At least one Sales Order Detail is required."}
            )

        # Validate each detail
        for detail in details:
            if not detail.get("SALES_ORDER_PROD_ID"):
                raise serializers.ValidationError(
                    {"details": "Each detail must include a SALES_ORDER_PROD_ID."}
                )

        return data

    def create(self, validated_data):
        # Check if CLIENT_ID is valid
        client = validated_data.get(
            "CLIENT_ID"
        )  # This will return the Clients instance
        if not client:
            raise ValueError("Client ID is required.")

        # Get the client instance
        client_instance = Clients.objects.get(
            id=client.id
        )  # Retrieve the actual Clients instance
        print(f"Client ID: {client_instance.id}")

        # Replace CLIENT_ID in validated_data with the actual Clients instance
        validated_data["CLIENT_ID"] = client_instance  # Assign the Clients instance

        # Extract SalesOrderDetails from validated data
        details_data = validated_data.pop("details", [])

        # Create SalesOrder instance
        sales_order = SalesOrder.objects.create(**validated_data)

        # Create SalesOrderDetails objects linked to this SalesOrder
        for detail in details_data:
            SalesOrderDetails.objects.create(SALES_ORDER_ID=sales_order, **detail)

        return sales_order

    def update(self, instance, validated_data):
        try:
            with transaction.atomic():
                # Update SalesOrder fields
                instance.SALES_ORDER_STATUS = validated_data.get(
                    "SALES_ORDER_STATUS", instance.SALES_ORDER_STATUS
                )
                instance.CLIENT_ID = validated_data.get("CLIENT_ID", instance.CLIENT_ID)
                instance.SALES_ORDER_CLIENT_NAME = validated_data.get(
                    "SALES_ORDER_CLIENT_NAME", instance.SALES_ORDER_CLIENT_NAME
                )
                instance.SALES_ORDER_CLIENT_PROVINCE = validated_data.get(
                    "SALES_ORDER_CLIENT_PROVINCE", instance.SALES_ORDER_CLIENT_PROVINCE
                )
                instance.SALES_ORDER_CLIENT_CITY = validated_data.get(
                    "SALES_ORDER_CLIENT_CITY", instance.SALES_ORDER_CLIENT_CITY
                )
                instance.SALES_ORDER_CLIENT_PHONE_NUM = validated_data.get(
                    "SALES_ORDER_CLIENT_PHONE_NUM",
                    instance.SALES_ORDER_CLIENT_PHONE_NUM,
                )
                instance.SALES_ORDER_DLVRY_OPTION = validated_data.get(
                    "SALES_ORDER_DLVRY_OPTION", instance.SALES_ORDER_DLVRY_OPTION
                )
                instance.SALES_ORDER_TOTAL_QTY = validated_data.get(
                    "SALES_ORDER_TOTAL_QTY", instance.SALES_ORDER_TOTAL_QTY
                )
                instance.SALES_ORDER_TOTAL_PRICE = validated_data.get(
                    "SALES_ORDER_TOTAL_PRICE", instance.SALES_ORDER_TOTAL_PRICE
                )
                instance.SALES_ORDER_TOTAL_DISCOUNT = validated_data.get(
                    "SALES_ORDER_TOTAL_DISCOUNT", instance.SALES_ORDER_TOTAL_DISCOUNT
                )
                instance.save()

                # Handle nested details update if present in the request data
                if "details" in validated_data:
                    details_data = validated_data.pop("details")

                    # Get existing details for the current SalesOrder
                    existing_details = {
                        detail.SALES_ORDER_DET_ID: detail
                        for detail in instance.sales_order.all()
                    }

                    # Update or create new SalesOrderDetails
                    for detail_data in details_data:
                        detail_id = detail_data.get("SALES_ORDER_DET_ID")

                        if detail_id:
                            # Update existing detail
                            if detail_id in existing_details:
                                detail_instance = existing_details.pop(detail_id)

                                # Update fields from detail_data, using existing values as defaults
                                detail_instance.SALES_ORDER_PROD_ID = detail_data.get(
                                    "SALES_ORDER_PROD_ID",
                                    detail_instance.SALES_ORDER_PROD_ID,
                                )
                                detail_instance.SALES_ORDER_PROD_NAME = detail_data.get(
                                    "SALES_ORDER_PROD_NAME",
                                    detail_instance.SALES_ORDER_PROD_NAME,
                                )
                                detail_instance.SALES_ORDER_LINE_PRICE = (
                                    detail_data.get(
                                        "SALES_ORDER_LINE_PRICE",
                                        detail_instance.SALES_ORDER_LINE_PRICE,
                                    )
                                )
                                detail_instance.SALES_ORDER_LINE_QTY = detail_data.get(
                                    "SALES_ORDER_LINE_QTY",
                                    detail_instance.SALES_ORDER_LINE_QTY,
                                )
                                detail_instance.SALES_ORDER_LINE_DISCOUNT = (
                                    detail_data.get(
                                        "SALES_ORDER_LINE_DISCOUNT",
                                        detail_instance.SALES_ORDER_LINE_DISCOUNT,
                                    )
                                )
                                detail_instance.SALES_ORDER_LINE_TOTAL = (
                                    detail_data.get(
                                        "SALES_ORDER_LINE_TOTAL",
                                        detail_instance.SALES_ORDER_LINE_TOTAL,
                                    )
                                )

                                # Save updated detail instance
                                detail_instance.save()
                            else:
                                # If detail ID is provided but not found, treat as new detail
                                SalesOrderDetails.objects.create(
                                    SALES_ORDER_ID=instance, **detail_data
                                )
                        else:
                            # If no detail ID is provided, create new SalesOrderDetails
                            SalesOrderDetails.objects.create(
                                SALES_ORDER_ID=instance, **detail_data
                            )

                    # Remove details not included in the update request
                    for detail in existing_details.values():
                        detail.delete()

            return instance

        except Exception as e:
            # Handle the error (optional logging or re-raising the exception)
            raise e
