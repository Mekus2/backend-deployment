from django.shortcuts import render
from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import DeliveryIssue, DeliveryItemIssue
from .serializers import DeliveryIssueSerializer, DeliveryItemIssueSerializer
from Admin.Customer.models import Clients
from Admin.Supplier.models import Supplier


import logging

logger = logging.getLogger(__name__)


class DeliveryIssueListAPI(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        """Fetch all delivery issues."""
        delivery_issues = DeliveryIssue.objects.prefetch_related("item_issues").all()

        response_data = []
        for issue in delivery_issues:
            delivery_details = issue.DELIVERY  # Resolve GenericForeignKey
            print(f"Issue {issue.ISSUE_NO}: DELIVERY -> {delivery_details}")
            print(f"Type of delivery_details -> {type(delivery_details)}")

            if issue.DELIVERY_TYPE:
                print(f"Issue {issue.ISSUE_NO}: DELIVERY_TYPE -> {issue.DELIVERY_TYPE}")
                print(
                    f"App Label: {issue.DELIVERY_TYPE.app_label}, Model: {issue.DELIVERY_TYPE.model}"
                )

            # Determine name based on DELIVERY_TYPE.model
            if delivery_details:
                delivery_model = (
                    issue.DELIVERY_TYPE.model.strip().lower()
                    if issue.DELIVERY_TYPE
                    else None
                )
                if delivery_model == "outbounddelivery":
                    # For outbound deliveries (Customer Delivery)
                    name = delivery_details.OUTBOUND_DEL_CUSTOMER_NAME
                    print(f"Issue {issue.ISSUE_NO}: Resolved to Customer {name}")
                elif delivery_model == "inbounddelivery":
                    # For inbound deliveries (Supply Delivery)
                    name = delivery_details.INBOUND_DEL_SUPP_NAME
                    print(f"Issue {issue.ISSUE_NO}: Resolved to Supplier {name}")
                else:
                    # Fallback for unknown types
                    name = "Uncategorized Delivery"
                    print(f"Issue {issue.ISSUE_NO}: Defaulting to Uncategorized")
            else:
                name = "Uncategorized Delivery"
                print(f"Issue {issue.ISSUE_NO}: No Delivery Details Found")

            # Serialize the issue and add the name
            serialized_issue = DeliveryIssueSerializer(issue).data
            serialized_issue["name"] = name
            response_data.append(serialized_issue)

        return Response(response_data, status=status.HTTP_200_OK)


# Create your views here.
class DeliveryIssueAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        """Create a new delivery issue along with its items."""
        data = request.data

        logger.debug("Received data for new delivery issue: %s", data)

        # Validate and get the delivery type and ID
        delivery_type = data.get("DELIVERY_TYPE")
        delivery_id = data.get("DELIVERY_ID")

        if not delivery_type or not delivery_id:
            logger.error("DELIVERY_TYPE and DELIVERY_ID are required.")
            return Response(
                {"error": "DELIVERY_TYPE and DELIVERY_ID are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Get the ContentType for the provided delivery type
            delivery_content_type = ContentType.objects.get(model=delivery_type.lower())
            data["DELIVERY_TYPE"] = delivery_content_type.id
        except ContentType.DoesNotExist:
            logger.error("Invalid DELIVERY_TYPE: %s", delivery_type)
            return Response(
                {"error": f"Invalid DELIVERY_TYPE: {delivery_type}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Use a database transaction to ensure atomicity
        with transaction.atomic():
            # Save DeliveryIssue
            serializer = DeliveryIssueSerializer(data=data)
            if serializer.is_valid():
                delivery_issue = serializer.save()
                logger.debug("Created DeliveryIssue: %s", delivery_issue)

                # Create DeliveryItemIssue if present in the request data
                item_issues_data = data.get("item_issues", [])
                for item_data in item_issues_data:
                    item_data["ISSUE_NO"] = (
                        delivery_issue.ISSUE_NO
                    )  # Add ISSUE_NO to item
                    item_serializer = DeliveryItemIssueSerializer(data=item_data)
                    if not item_serializer.is_valid():
                        # Rollback the transaction if any item fails
                        logger.error("Validation failed for item: %s", item_data)
                        transaction.set_rollback(True)
                        return Response(
                            {
                                "error": "Validation failed for one or more items.",
                                "item_errors": item_serializer.errors,
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    item_serializer.save()
                    logger.debug("Created DeliveryItemIssue: %s", item_serializer.data)

                # If all items are valid, return the created delivery issue
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                # Rollback if the main serializer is invalid
                logger.error(
                    "Validation failed for DeliveryIssue: %s", serializer.errors
                )
                transaction.set_rollback(True)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeliveryItemIssueAPIView(APIView):
    def get(self, request):
        """Fetch all delivery item issues."""
        delivery_item_issues = DeliveryItemIssue.objects.all()
        serializer = DeliveryItemIssueSerializer(delivery_item_issues, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new delivery item issue."""
        serializer = DeliveryItemIssueSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
