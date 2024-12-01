from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import DeliveryIssue, DeliveryItemIssue


# Create your views here.
class DeliveryIssueCreateAPIView(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        order_type = data.get("ORDER_TYPE")

        # Ensure order type is valid
        if order_type not in ["Sales Order", "Purchase Order"]:
            return Response(
                {
                    "error": "Invalid ORDER_TYPE. Must be 'Sales Order' or 'Purchase Order'."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Ensure at least one set of data (supplier or customer) is provided
        if not any(
            [
                data.get("SUPPLIER_ID"),
                data.get("SUPPLIER_NAME"),
                data.get("CUSTOMER_ID"),
                data.get("CUSTOMER_NAME"),
            ]
        ):
            return Response(
                {
                    "error": "Either supplier data (SUPPLIER_ID or SUPPLIER_NAME) "
                    "or customer data (CUSTOMER_ID or CUSTOMER_NAME) must be provided."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Create DeliveryIssue
            delivery_issue = DeliveryIssue.objects.create(
                ORDER_TYPE=order_type,
                STATUS=data.get("STATUS"),
                ISSUE_TYPE=data.get("ISSUE_TYPE"),
                PURCHASE_ORDER_ID_id=data.get("PURCHASE_ORDER_ID"),
                SUPPLIER_ID_id=data.get("SUPPLIER_ID"),
                SUPPLIER_NAME=data.get("SUPPLIER_NAME"),
                SALES_ORDER_ID_id=data.get("SALES_ORDER_ID"),
                CUSTOMER_ID_id=data.get("CUSTOMER_ID"),
                CUSTOMER_NAME=data.get("CUSTOMER_NAME"),
                REMARKS=data.get("REMARKS"),
                IS_RESOLVED=data.get("IS_RESOLVED", False),
            )

            # Handle details for DeliveryItemIssue
            details = data.get("details", [])
            if not details:
                return Response(
                    {"error": "Details must be provided for the delivery issue."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            for detail in details:
                DeliveryItemIssue.objects.create(
                    ISSUE_NO=delivery_issue,
                    ISSUE_PROD_ID=detail.get("ISSUE_PROD_ID"),
                    ISSUE_PROD_NAME=detail.get("ISSUE_PROD_NAME"),
                    ISSUE_QTY_DEFECT=detail.get("ISSUE_QTY_DEFECT"),
                    ISSUE_PROD_LINE_PRICE=detail.get("ISSUE_PROD_LINE_PRICE"),
                    ISSUE_LINE_TOTAL_PRICE=detail.get("ISSUE_LINE_TOTAL_PRICE"),
                )

            return Response(
                {"message": "Delivery issue and details created successfully."},
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            return Response(
                {
                    "error": f"An error occurred while creating the delivery issue: {str(e)}"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
