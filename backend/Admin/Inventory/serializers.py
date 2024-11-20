from rest_framework import serializers
from .models import Inventory


class AddProductInventory(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = [
            "PRODUCT_ID",
            "INBOUND_DEL_ID",
            "BATCH_ID",
            "EXPIRY_DATE",
            "QUANTITY",
        ]
