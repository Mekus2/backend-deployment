from rest_framework import serializers
from .models import SalesInvoice, CustomerPayment, SalesInvoiceItems


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


class SalesInvoiceSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="CLIENT.name", read_only=True)
    client_address = serializers.CharField(source="CLIENT.address", read_only=True)
    client_province = serializers.CharField(source="CLIENT.province", read_only=True)

    class Meta:
        model = SalesInvoice
        fields = [
            "SALES_INV_ID",
            "SALES_INV_DATETIME",
            "SALES_INV_DISCOUNT",
            "SALES_INV_TOTAL_PRICE",
            "SALES_INV_TOTAL_GROSS_REVENUE",
            "SALES_INV_TOTAL_GROSS_INCOME",
            "OUTBOUND_DEL_ID",
            "client_name",
            "client_address",
            "client_province",
        ]


class SalesInvoiceItemsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesInvoiceItems
        fields = [
            "SALES_INV_ITEM_PROD_ID",
            "SALES_INV_ITEM_PROD_NAME",
            "SALES_INV_item_PROD_DLVRD",
            "SALES_INV_ITEM_PROD_SELL_PRICE",
            "SALES_INV_ITEM_PROD_PURCH_PRICE",
            "SALES_INV_ITEM_LINE_GROSS_REVENUE",
            "SALES_INV_ITEM_LINE_GROSS_INCOME",
        ]
