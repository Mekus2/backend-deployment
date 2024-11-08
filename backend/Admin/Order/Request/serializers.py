from rest_framework import serializers
from .models import OrderRequestDetails, OrderRequest


class OrderRequestDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderRequestDetails
        fields = [
            "ORDER_REQ_DETAILS_ID",
            "ORDER_REQ_PRODUCT_ID",
            "ORDER_REQ_PRODUCT_NAME",
            "ORDER_REQ_QTY",
            "ORDER_REQ_PRICE",
            "ORDER_REQ_LINE_TOTAL",
            "ORDER_REQ_SUB_TOTAL",
            "ORDER_ID",
        ]
        extra_kwargs = {
            "ORDER_ID": {"required": False}
            # ORDER_ID will be auto-populated, not provided by the user
        }


class OrderRequestSerializer(serializers.ModelSerializer):
    # Replace SerializerMethodField with the nested OrderRequestDetailSerializer  # noqa:E501
    details = OrderRequestDetailsSerializer(
        many=True, source="order_details", required=False
    )

    class Meta:
        model = OrderRequest
        fields = [
            "ORDER_ID",
            "ORDER_DATE_CREATED",
            "ORDER_STATUS",
            "ORDER_CREATEDBY_USER",
            "details",
        ]

    def get_details(self, obj):
        # Use the related name to retrieve all related details
        details = obj.order_details.all()
        return OrderRequestDetailsSerializer(details, many=True).data

    def validate(self, data):
        details = data.get("order_details", [])
        print("Details received for validation:", details)  # Debug output

        if not details:
            raise serializers.ValidationError(
                {"details": "At least one Order RequestDetail is required."}
            )  # noqa: E501

        for detail in details:
            if not detail.get("ORDER_REQ_PRODUCT_ID"):
                raise serializers.ValidationError(
                    {
                        "details": "Each detail must include an ORDER_REQ_PRODUCT_ID."
                    }  # noqa:E501
                )

        return data

    # Override the create method to handle nested OrderRequestDetails
    def create(self, validated_data):
        # Extract details from the validated data
        details_data = validated_data.pop("order_details", [])

        # Create the OrderRequest object
        order_request = OrderRequest.objects.create(**validated_data)  # noqa:E501

        # Create OrderRequestDetails objects for each detail
        for detail in details_data:
            OrderRequestDetails.objects.create(
                ORDER_ID=order_request, **detail
            )  # noqa:E501

        return order_request

    def update(self, instance, validated_data):
        # Update OrderRequest fields
        instance.ORDER_STATUS = validated_data.get(
            "ORDER_STATUS", instance.ORDER_STATUS
        )
        instance.ORDER_CREATEDBY_USER = validated_data.get(
            "ORDER_CREATEDBY_USER", instance.ORDER_CREATEDBY_USER
        )
        instance.save()

        # Handle nested details update
        if "details" in validated_data:
            details_data = validated_data.pop("details")

            # Get existing details for the current OrderRequest
            existing_details = {
                detail.ORDER_REQ_DETAILS_ID: detail
                for detail in instance.order_details.all()
            }

            # Update or create details
            for detail_data in details_data:
                detail_id = detail_data.get("ORDER_REQ_DETAILS_ID")
                if detail_id:
                    # Update existing detail
                    if detail_id in existing_details:
                        detail_instance = existing_details.pop(detail_id)
                        detail_instance.ORDER_REQ_PRODUCT_NAME = detail_data.get(
                            "ORDER_REQ_PRODUCT_NAME",
                            detail_instance.ORDER_REQ_PRODUCT_NAME,
                        )
                        detail_instance.ORDER_REQ_QTY = detail_data.get(
                            "ORDER_REQ_QTY", detail_instance.ORDER_REQ_QTY
                        )
                        detail_instance.ORDER_REQ_PRICE = detail_data.get(
                            "ORDER_REQ_PRICE", detail_instance.ORDER_REQ_PRICE
                        )
                        detail_instance.ORDER_REQ_LINE_TOTAL = detail_data.get(
                            "ORDER_REQ_LINE_TOTAL",
                            detail_instance.ORDER_REQ_LINE_TOTAL,
                        )
                        detail_instance.ORDER_REQ_SUB_TOTAL = detail_data.get(
                            "ORDER_REQ_SUB_TOTAL",
                            detail_instance.ORDER_REQ_SUB_TOTAL,
                        )
                        detail_instance.save()
                    else:
                        # If detail ID is provided but not found, treat as new detail  # noqa:E501
                        detail_data.pop("ORDER_ID", None)
                        # Remove ORDER_ID if present to avoid duplication
                        OrderRequestDetails.objects.create(
                            ORDER_ID=instance, **detail_data
                        )
                else:
                    # Create new OrderRequestDetails
                    detail_data.pop(
                        "ORDER_ID", None
                    )  # Remove ORDER_ID if present to avoid duplication
                    OrderRequestDetails.objects.create(ORDER_ID=instance, **detail_data)

            # Remove details not in the update request
            for detail in existing_details.values():
                detail.delete()

        return instance


class OrderRequestListSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderRequest
        fields = [
            "ORDER_ID",
            "ORDER_DATE_CREATED",
            "ORDER_STATUS",
            "ORDER_CREATEDBY_USER",
        ]
