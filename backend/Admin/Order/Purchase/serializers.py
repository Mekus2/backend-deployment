from rest_framework import serializers
from django.db import transaction
from .models import PurchaseOrder, PurchaseOrderDetails


class PurchaseOrderDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        moded = PurchaseOrderDetails
        fields = [
            "PURCHASE_ORDER_DET_ID"
            "PURCHASE_ORDER_DET_PROD_ID"
            "PURCHASE_ORDER_DET_PROD_NAME"
            "PURCHASE_ORDER_ID"
        ]
        extra_kwargs = {
            "PURCHASE_ORDER_ID": {"required": False}  # will be auto populated
        }


class PurchaseOrderSerializer(serializers.ModelSerializer):
    model = PurchaseOrder
    fields = [
        "PURCHASE_ORDER_ID",
        "PURCHASE_ORDER_STATUS",
        "PURCHASE_ORDER_TOTAL_QTY",
        "PURCHASE_ORDER_SUPPLIER_ID",
        "PURCHASE_ORDER_SUPPLIER_NAME",
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
            if not detail.get("PURCHASE_ORDER_DET_PROD_ID"):
                raise serializers.ValidationError(
                    {"details": "At least include one Product in the order "}
                )
        return data
