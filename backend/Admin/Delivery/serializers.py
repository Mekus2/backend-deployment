from rest_framework import serializers
from .models import (
    OutboundDelivery,
    OutboundDeliveryDetails,
    InboundDelivery,
    InboundDeliveryDetails,
)


class OutboundDeliveryDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = OutboundDeliveryDetails
        fields = [
            "OUTBOUND_DEL_DETAIL_ID",
            "OUTBOUND_DEL_ID",
            "OUTBOUND_DETAILS_PROD_NAME",
            "OUTBOUND_DETAILS_PROD_QTY",
            "OUTBOUND_DETAILS_LINE_PRICE",
        ]
        extra_kwargs = {"OUTBOUND_DEL_ID": {"required": False}}


class OutboundDeliverySerializer(serializers.ModelSerializer):
    details = OutboundDeliveryDetailsSerializer(many=True, required=False)

    class Meta:
        model = OutboundDelivery
        fields = [
            "OUTBOUND_DEL_ID",
            "SALES_ORDER_ID",
            # "OUTBOUND_DEL_SHIPPED_DATE",
            # "OUTBOUND_DEL_CSTMR_RCVD_DATE",
            "OUTBOUND_DEL_CUSTOMER_NAME",
            "OUTBOUND_DEL_TOTAL_PRICE",
            "OUTBOUNND_DEL_DISCOUNT",
            "OUTBOUND_DEL_STATUS",
            "OUTBOUND_DEL_DLVRD_QTY",
            "OUTBOUND_DEL_DLVRY_OPTION",
            "OUTBOUND_DEL_CITY",
            "OUTBOUND_DEL_PROVINCE",
            "OUTBOUND_DEL_CREATED",
            # "OUTBOUND_DEL_DATEUPDATED",
            "OUTBOUND_DEL_ACCPTD_BY_USER",
            "details",
        ]

    def create(self, validated_data):
        # Extract details data from the validated data
        details_data = validated_data.pop("details", [])

        # Create the OutboundDelivery instance
        outbound_delivery = OutboundDelivery.objects.create(**validated_data)

        # Create OutboundDeliveryDetails for each item in details_data
        for detail_data in details_data:
            OutboundDeliveryDetails.objects.create(
                OUTBOUND_DEL_ID=outbound_delivery, **detail_data
            )

        return outbound_delivery


class CreateOutboundDeliveryDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = OutboundDeliveryDetails
        fields = [
            "OUTBOUND_DEL_ID",
            "OUTBOUND_DETAILS_PROD_NAME",
            "OUTBOUND_DETAILS_PROD_QTY",
            "OUTBOUND_DETAILS_LINE_PRICE",
        ]

        extra_kwargs = {"OUTBOUND_DEL_ID": {"required": False}}


class CreateOutboundDeliverySerializer(serializers.ModelSerializer):
    details = CreateOutboundDeliveryDetailsSerializer(many=True, required=False)

    class Meta:
        model = OutboundDelivery
        fields = [
            "SALES_ORDER_ID",
            "OUTBOUND_DEL_CUSTOMER_NAME",
            "OUTBOUND_DEL_DLVRY_OPTION",
            "OUTBOUND_DEL_CITY",
            "OUTBOUND_DEL_PROVINCE",
            "OUTBOUND_DEL_ACCPTD_BY_USER",
            "details",
        ]


class UpdateInboundStatus(serializers.ModelSerializer):
    class Meta:
        model = InboundDelivery
        fields = ["INBOUND_DEL_STATUS"]


class InboundDeliveryDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = InboundDeliveryDetails
        fields = [
            "INBOUND_DEL_DETAIL_ID",
            "INBOUND_DEL_ID",
            "INBOUND_DEL_DETAIL_PROD_ID",
            "INBOUND_DEL_DETAIL_PROD_NAME",
            "INBOUND_DEL_DETAIL_LINE_PRICE",
            "INBOUND_DEL_DETAIL_ORDERED_QTY",
            "INBOUND_DEL_DETAIL_LINE_QTY",
            "INBOUND_DEL_DETAIL_LINE_QTY_DEFECT",
            "INBOUND_DEL_DETAIL_PROD_EXP_DATE",
            "INBOUND_DEL_DETAIL_BATCH_ID",
        ]

        extra_kwargs = {"INBOUND_DEL_ID": {"required": False}}


class InboundDeliverySerializer(serializers.ModelSerializer):
    details = InboundDeliveryDetailsSerializer(many=True, required=False)

    class Meta:
        model = InboundDelivery
        fields = [
            "INBOUND_DEL_ID",
            "PURCHASE_ORDER_ID",
            "INBOUND_DEL_SUPP_ID",
            "INBOUND_DEL_SUPP_NAME",
            "INBOUND_DEL_STATUS",
            "INBOUND_DEL_TOTAL_RCVD_QTY",
            "INBOUND_DEL_TOTAL_PRICE",
            "INBOUND_DEL_ORDER_DATE_CREATED",
            "INBOUND_DEL_ORDER_APPRVDBY_USER",
            "INBOUND_DEL_RCVD_BY_USER_NAME",
            "details",
        ]


class CreateInboundDeliveryDetailsSerializer(serializers.ModelSerializer):

    class Meta:
        model = InboundDeliveryDetails
        fields = [
            "INBOUND_DEL_DETAIL_ID",
            "INBOUND_DEL_ID",
            "INBOUND_DEL_DETAIL_PROD_ID",
            "INBOUND_DEL_DETAIL_PROD_NAME",
            "INBOUND_DEL_DETAIL_ORDERED_QTY",
        ]

        extra_kwargs = {"INBOUND_DEL_ID": {"required": False}}


class CreateInboundDeliverySerializer(serializers.ModelSerializer):
    details = CreateInboundDeliveryDetailsSerializer(many=True, required=False)

    class Meta:
        model = InboundDelivery
        fields = [
            "INBOUND_DEL_ID",
            "PURCHASE_ORDER_ID",
            "INBOUND_DEL_SUPP_ID",
            "INBOUND_DEL_SUPP_NAME",
            "INBOUND_DEL_TOTAL_ORDERED_QTY",
            "INBOUND_DEL_ORDER_APPRVDBY_USER",
            "details",
        ]


class UpdateInboundDeliverySerializer(serializers.ModelSerializer):

    class Meta:
        model = InboundDelivery
        fields = [
            "INBOUND_DEL_DATE_DELIVERED",
            "INBOUND_DEL_STATUS",
            "INBOUND_DEL_TOTAL_RCVD_QTY",
            "INBOUND_DEL_TOTAL_PRICE",
            "INBOUND_DEL_RCVD_BY_USER_NAME",
        ]


class UpdateInboundDeliveryDetailsSerializer(serializers.ModelSerializer):

    class Meta:
        model = InboundDeliveryDetails
        fields = [
            "INBOUND_DEL_DETAIL_LINE_PRICE",
            "INBOUND_DEL_DETAIL_LINE_QTY",
            "INBOUND_DEL_DETAIL_LINE_QTY_DEFECT",
            "INBOUND_DEL_DETAIL_PROD_EXP_DATE",
            "INBOUND_DEL_DETAIL_BATCH_ID",
        ]
