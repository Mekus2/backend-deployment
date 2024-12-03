from rest_framework import serializers
from .models import SalesInvoice


class SalesInvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesInvoice
        fields = "__all__"
