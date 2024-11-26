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
