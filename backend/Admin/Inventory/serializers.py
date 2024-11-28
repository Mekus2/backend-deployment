from rest_framework import serializers
from .models import Inventory


class ProductDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = [
            "PRODUCT_ID",
            "PRODUCT_NAME",
            "QUANTITY_ON_HAND",
            "EXPIRY_DATE",
        ]


class AddProductInventorySerializer(serializers.ModelSerializer):
    details = ProductDetailsSerializer(many=True)

    class Meta:
        model = Inventory
        fields = [
            "INBOUND_DEL_ID",
            "details",
        ]


class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = [
            "INVENTORY_ID", "PRODUCT_ID", "PRODUCT_NAME", "INBOUND_DEL_ID", 
            "BATCH_ID", "EXPIRY_DATE", "QUANTITY_ON_HAND", "LAST_UPDATED", 
            "DATE_CREATED"
        ]