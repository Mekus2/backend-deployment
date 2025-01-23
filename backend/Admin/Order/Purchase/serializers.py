from rest_framework import serializers
from django.db import transaction
from .models import PurchaseOrder, PurchaseOrderDetails
from ...Product.models import Product


class PurchaseOrderDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseOrderDetails
        fields = [
            "PURCHASE_ORDER_DET_ID",
            "PURCHASE_ORDER_DET_PROD_ID",
            "PURCHASE_ORDER_DET_PROD_NAME",
            "PURCHASE_ORDER_DET_PROD_LINE_QTY",
            "PURCHASE_ORDER_ID",
        ]
        extra_kwargs = {
            "PURCHASE_ORDER_ID": {"required": False},  # will be auto populated
            "PURCHASE_ORDER_DET_PROD_ID": {"required": False},
        }


class PurchaseOrderSerializer(serializers.ModelSerializer):
    details = PurchaseOrderDetailsSerializer(many=True, required=False)

    class Meta:
        model = PurchaseOrder
        fields = [
            "PURCHASE_ORDER_ID",
            "PURCHASE_ORDER_STATUS",
            "PURCHASE_ORDER_TOTAL_QTY",
            "PURCHASE_ORDER_SUPPLIER_ID",
            "PURCHASE_ORDER_SUPPLIER_CMPNY_NUM",
            "PURCHASE_ORDER_SUPPLIER_CMPNY_NAME",
            "PURCHASE_ORDER_CONTACT_PERSON",
            "PURCHASE_ORDER_CONTACT_NUMBER",
            "PURCHASE_ORDER_DATE_CREATED",
            "PURCHASE_ORDER_DATE_UPDATED",
            "PURCHASE_ORDER_CREATEDBY_USER",
            "details",
        ]

    def validate(sellf, data):
        details = data.get("details", [])
        print("Received Details for validation:", details)

        supplier_id = data.get("PURCHASE_ORDER_SUPPLIER_ID")
        print("Received Supplier ID:", supplier_id)

        if not details:
            raise serializers.ValidationError(
                {"details": "At least one Purchase Order Detail is required."}
            )

        for detail in details:
            if not detail.get("PURCHASE_ORDER_DET_PROD_NAME"):
                raise serializers.ValidationError(
                    {"details": "At least include one Product in the order "}
                )
        return data

    def create(self, validated_data):
        details_data = validated_data.pop("details", [])

        # Create the PurchaseOrder instance
        purchase_order = PurchaseOrder.objects.create(**validated_data)

        # Create related PurchaseOrderDetails instances
        for detail_data in details_data:
            # Set the purchase_order instance directly to PURCHASE_ORDER_ID
            detail_data["PURCHASE_ORDER_ID"] = purchase_order
            PurchaseOrderDetails.objects.create(**detail_data)

        return purchase_order


class PurchaseOrderDetailsUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseOrderDetails
        fields = (
            "PURCHASE_ORDER_DET_ID",
            "PURCHASE_ORDER_DET_PROD_ID",
            "PURCHASE_ORDER_DET_PROD_NAME",
            "PURCHASE_ORDER_DET_PROD_LINE_QTY",
        )


# PurchaseOrder serializer for updating PurchaseOrder and details
class PurchaseOrderUpdateSerializer(serializers.ModelSerializer):
    details = PurchaseOrderDetailsUpdateSerializer(many=True, required=False)

    class Meta:
        model = PurchaseOrder
        fields = (
            "PURCHASE_ORDER_STATUS",
            "PURCHASE_ORDER_TOTAL_QTY",
            "PURCHASE_ORDER_SUPPLIER_ID",
            "PURCHASE_ORDER_SUPPLIER_CMPNY_NAME",
            "PURCHASE_ORDER_SUPPLIER_CMPNY_NUM",
            "PURCHASE_ORDER_CONTACT_PERSON",
            "PURCHASE_ORDER_CONTACT_NUMBER",
            "details",
        )


class BasayPurchaseOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseOrder
        fields = "__all__"
