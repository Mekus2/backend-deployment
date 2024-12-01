from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import DeliveryIssue, DeliveryItemIssue
from Admin.Delivery.models import InboundDelivery, OutboundDelivery
from Admin.Customer.models import Clients
from Admin.Supplier.models import Supplier

import logging

logger = logging.getLogger(__name__)


# Create your views here.
class DeliveryIssueCreateAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        data = request.data
        order_type = data.get("ORDER_TYPE")

        # Log the incoming data for debugging
        logger.info(f"Received delivery issue request: {data}")

        # Ensure order type is valid
        if order_type not in ["Supplier Delivery", "Customer Delivery"]:
            logger.error(f"Invalid ORDER_TYPE: {order_type}")
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
            logger.error("Neither supplier nor customer data was provided.")
            return Response(
                {
                    "error": "Either supplier data (SUPPLIER_ID or SUPPLIER_NAME) "
                    "or customer data (CUSTOMER_ID or CUSTOMER_NAME) must be provided."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Initialize variables
        supplier_delivery_instance = None
        supplier_id_instance = None
        customer_delivery_instance = None
        customer_id_instance = None

        # Handle Inbound Delivery (SUPPLIER)
        if order_type == "Supplier Delivery":
            if data.get("SUPPLIER_DELIVERY_ID") and data.get("SUPPLIER_ID"):
                try:
                    supplier_delivery_instance = InboundDelivery.objects.get(
                        INBOUND_DEL_ID=data.get("SUPPLIER_DELIVERY_ID")
                    )
                    supplier_id_instance = Supplier.objects.get(
                        id=data.get("SUPPLIER_ID")
                    )
                except InboundDelivery.DoesNotExist:
                    logger.error(
                        f"Invalid SUPPLIER_DELIVERY_ID: {data.get('SUPPLIER_DELIVERY_ID')}"
                    )
                    return Response(
                        {"error": "Invalid SUPPLIER_DELIVERY_ID."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                except Supplier.DoesNotExist:
                    logger.error(f"Invalid SUPPLIER_ID: {data.get('SUPPLIER_ID')}")
                    return Response(
                        {"error": "Invalid SUPPLIER_ID."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

        # Handle Outbound Delivery (CUSTOMER)
        elif order_type == "Customer Delivery":
            if data.get("CUSTOMER_DELIVERY_ID") and data.get("CUSTOMER_ID"):
                try:
                    # Fetch the outbound delivery and client instances
                    customer_delivery_instance = OutboundDelivery.objects.get(
                        OUTBOUND_DEL_ID=data.get("CUSTOMER_DELIVERY_ID")
                    )
                    customer_id_instance = Clients.objects.get(
                        id=data.get("CUSTOMER_ID")
                    )
                except OutboundDelivery.DoesNotExist:
                    logger.error(
                        f"Invalid CUSTOMER_DELIVERY_ID: {data.get('CUSTOMER_DELIVERY_ID')}"
                    )
                    return Response(
                        {"error": "Invalid Customer Delivery ID."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                except Clients.DoesNotExist:
                    logger.error(f"Invalid CUSTOMER_ID: {data.get('CUSTOMER_ID')}")
                    return Response(
                        {"error": "Invalid Customer ID."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

        try:
            delivery_issue = DeliveryIssue.objects.create(
                ORDER_TYPE=order_type,
                ISSUE_TYPE=data.get("ISSUE_TYPE"),
                RESOLUTION=data.get("RESOLUTION"),
                SUPPLIER_DELIVERY_ID=(
                    supplier_delivery_instance
                    if order_type == "Supplier Delivery"
                    else None
                ),
                SUPPLIER_ID=(
                    supplier_id_instance if order_type == "Supplier Delivery" else None
                ),
                SUPPLIER_NAME=(
                    data.get("SUPPLIER_NAME")
                    if order_type == "Supplier Delivery"
                    else None
                ),
                CUSTOMER_DELIVERY_ID_id=(
                    customer_delivery_instance
                    if order_type == "Customer Delivery"
                    else None
                ),
                CUSTOMER_ID=(
                    customer_id_instance if order_type == "Customer Delivery" else None
                ),
                CUSTOMER_NAME=(
                    data.get("CUSTOMER_NAME")
                    if order_type == "Customer Delivery"
                    else None
                ),
                REMARKS=data.get("REMARKS"),
                IS_RESOLVED=False,
            )

            # Handle details for DeliveryItemIssue
            details = data.get("details", [])
            if not details:
                logger.error("No details were provided in the request.")
                return Response(
                    {"error": "Details must be provided for the delivery issue."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            for detail in details:
                try:
                    DeliveryItemIssue.objects.create(
                        ISSUE_NO=delivery_issue,
                        ISSUE_PROD_ID=detail.get("ISSUE_PROD_ID"),
                        ISSUE_PROD_NAME=detail.get("ISSUE_PROD_NAME"),
                        ISSUE_QTY_DEFECT=detail.get("ISSUE_QTY_DEFECT"),
                        ISSUE_PROD_LINE_PRICE=detail.get("ISSUE_PROD_LINE_PRICE"),
                        ISSUE_LINE_TOTAL_PRICE=detail.get("ISSUE_LINE_TOTAL_PRICE"),
                    )
                except Exception as e:
                    logger.error(f"Failed to create DeliveryItemIssue: {str(e)}")
                    return Response(
                        {"error": f"Failed to create DeliveryItemIssue: {str(e)}"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            logger.info(
                f"Delivery issue {delivery_issue.ISSUE_NO} and details created successfully."
            )
            return Response(
                {"message": "Delivery issue and details created successfully."},
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            logger.error(
                f"An error occurred while creating the delivery issue: {str(e)}"
            )
            return Response(
                {
                    "error": f"An error occurred while creating the delivery issue: {str(e)}"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GetIssueListAPI(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        try:
            # Fetch all delivery issues and order them by the creation date in descending order
            issues = DeliveryIssue.objects.all().order_by(
                "-DATE_CREATED"
            )  # Descending order

            # Optionally, filter the issues if any query parameters are provided
            order_type = request.query_params.get("ORDER_TYPE", None)
            if order_type:
                issues = issues.filter(ORDER_TYPE=order_type)

            # Prepare the response data (you can customize this as per your needs)
            issue_list = []
            for issue in issues:
                issue_data = {
                    "id": issue.ISSUE_NO,
                    "ORDER_TYPE": issue.ORDER_TYPE,
                    "STATUS": issue.STATUS,
                    "ISSUE_TYPE": issue.ISSUE_TYPE,
                    "RESOLUTION": issue.RESOLUTION,
                    "SUPPLIER_DELIVERY_ID": issue.SUPPLIER_DELIVERY_ID,
                    "SUPPLIER_ID": issue.SUPPLIER_ID,
                    "SUPPLIER_NAME": issue.SUPPLIER_NAME,
                    "CUSTOMER_DELIVERY_ID": issue.CUSTOMER_DELIVERY_ID,
                    "CUSTOMER_ID": issue.CUSTOMER_ID,
                    "CUSTOMER_NAME": issue.CUSTOMER_NAME,
                    "REMARKS": issue.REMARKS,
                    "IS_RESOLVED": issue.IS_RESOLVED,
                    "DATE_CREATED": issue.DATE_CREATED,
                }
                issue_list.append(issue_data)

            # Return the list of issues
            return Response(issue_list, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error occurred while fetching delivery issues: {str(e)}")
            return Response(
                {"error": f"Error occurred while fetching delivery issues: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
