from rest_framework import serializers
from .models import SalesInvoice, CustomerPayment


class SalesInvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesInvoice
        fields = "__all__"


class CustomerPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerPayment
        fields = "__all__"


class CustomerPaymentListSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerPayment
        fields = [
            "PAYMENT_ID",
            "OUTBOUND_DEL_ID",
            "CLIENT_ID",
            "CLIENT_NAME",
            "PAYMENT_TERMS",
            "PAYMENT_START_DATE",
            "PAYMENT_DUE_DATE",
            "PAYMENT_METHOD",
            "PAYMENT_TERMS",
            "PAYMENT_STATUS",
            "AMOUNT_PAID",
            "AMOUNT_BALANCE",
        ]
