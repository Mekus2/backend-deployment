from django.shortcuts import render
from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import DeliveryIssue, DeliveryItemIssue, ReplacementHold
from .serializers import DeliveryIssueSerializer, DeliveryItemIssueSerializer
from Admin.Customer.models import Clients
from Admin.Supplier.models import Supplier
from Admin.Inventory.models import Inventory
from Admin.Delivery.models import OutboundDelivery, OutboundDeliveryDetails
from decimal import Decimal

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

                elif delivery_model == "inbounddelivery":
                    # For inbound deliveries (Supply Delivery)
                    name = delivery_details.INBOUND_DEL_SUPP_NAME

                else:
                    # Fallback for unknown types
                    name = "Uncategorized Delivery"

            else:
                name = "Uncategorized Delivery"

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


# View for resolving issue
class ResolveIssueAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        """
        Process the resolve issue scenario.
        """
        data = request.data

        # Extract fields from the request
        issue_no = data.get("Issue No")
        delivery_id = data.get("Delivery ID")
        delivery_type = data.get("Delivery Type")
        resolution = data.get("Resolution")
        items = data.get("items", [])

        # Print the items received
        print("Items received:", items)
        # Validate input
        if not issue_no or not delivery_id or not delivery_type or not resolution:
            return Response(
                {"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST
            )

        if not isinstance(items, list) or not items:
            return Response(
                {"error": "Items must be a non-empty list"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Fetch the DeliveryIssue instance
        try:
            delivery_issue = DeliveryIssue.objects.get(pk=issue_no)
            logger.info(f"Found delivery issue with ID {issue_no}")
        except DeliveryIssue.DoesNotExist:
            logger.error(f"Delivery issue with ID {issue_no} not found.")
            return Response(
                {"error": f"Issue with ID {issue_no} not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            # Start a transaction to ensure atomicity
            with transaction.atomic():
                if resolution == "Offset" and (
                    delivery_type == "Customer Delivery"
                    or delivery_type == "Supplier Delivery"
                ):
                    # Update the resolution status for Customer Delivery with Offset resolution
                    delivery_issue.RESOLUTION_STATUS = "Offset"
                    delivery_issue.STATUS = "Resolved"
                    delivery_issue.save()

                    logger.info(
                        f"Resolution updated to Offset for Customer Delivery, issue ID {issue_no}"
                    )

                    return Response(
                        {
                            "message": "Resolution updated to Offset for Customer Delivery"
                        },
                        status=status.HTTP_200_OK,
                    )

                elif (
                    resolution == "Replacement" and delivery_type == "Customer Delivery"
                ):
                    # Handle Replacement for Customer Delivery
                    for item in items:
                        product_id = item.get("PROD_ID")
                        quantity_to_deduct = item.get("QTY_DEFECT")
                        price = Decimal(item.get("PRICE", 0))

                        if not product_id:
                            return Response(
                                {"error": "Missing product ID for item."},
                                status=status.HTTP_400_BAD_REQUEST,
                            )

                        if quantity_to_deduct <= 0:
                            return Response(
                                {"error": "Invalid quantity to deduct for product."},
                                status=status.HTTP_400_BAD_REQUEST,
                            )

                        # Fetch inventory batches for the product, ordered by nearest expiry date
                        inventory_batches = Inventory.objects.filter(
                            PRODUCT_ID=product_id
                        ).order_by("EXPIRY_DATE")

                        if not inventory_batches.exists():
                            return Response(
                                {
                                    "error": f"No inventory available for product {product_id}."
                                },
                                status=status.HTTP_400_BAD_REQUEST,
                            )

                        total_deducted = 0  # Initialize this variable inside the loop

                        # Deduct from inventory batches based on the quantity required
                        for batch in inventory_batches:
                            if total_deducted >= quantity_to_deduct:
                                break

                            deduct_from_batch = min(
                                batch.QUANTITY_ON_HAND,
                                quantity_to_deduct - total_deducted,
                            )
                            batch.QUANTITY_ON_HAND -= deduct_from_batch
                            total_deducted += deduct_from_batch

                            # Set IS_ACTIVE to False if QUANTITY_ON_HAND reaches 0
                            if batch.QUANTITY_ON_HAND == 0:
                                batch.IS_ACTIVE = False

                            batch.save()

                            logger.info(
                                f"Deducted {deduct_from_batch} from batch {batch.BATCH_ID} "
                                f"for product {batch.PRODUCT_NAME}. Remaining in batch: {batch.QUANTITY_ON_HAND}"
                            )

                        if total_deducted < quantity_to_deduct:
                            return Response(
                                {
                                    "error": f"Insufficient inventory for product {product_id}. "
                                    f"Needed: {quantity_to_deduct}, Available: {total_deducted}."
                                },
                                status=status.HTTP_400_BAD_REQUEST,
                            )

                        # After deducting inventory, update outbound delivery details
                        outbound_delivery = OutboundDelivery.objects.filter(
                            OUTBOUND_DEL_ID=delivery_id  # Using OUTBOUND_DEL_ID here, as we are dealing with outbound deliveries
                        ).first()

                        if outbound_delivery:
                            # Fetch the outbound delivery details for the specific product
                            outbound_delivery_detail = (
                                OutboundDeliveryDetails.objects.filter(
                                    OUTBOUND_DEL_ID=outbound_delivery.OUTBOUND_DEL_ID,
                                    OUTBOUND_DETAILS_PROD_ID=product_id,
                                ).first()
                            )

                            if outbound_delivery_detail:
                                # Reset or update the quantity in the outbound delivery details for the specific product
                                outbound_delivery_detail.OUTBOUND_DETAILS_PROD_QTY_ACCEPTED += (
                                    total_deducted
                                )
                                # Add the total price for the quantity deducted to OUTBOUND_DETAILS_LINE_TOTAL_PRICE
                                outbound_delivery_detail.OUTBOUND_DETAIL_LINE_TOTAL += (
                                    price * total_deducted
                                )
                                outbound_delivery_detail.save()

                                logger.info(
                                    f"Updated outbound delivery detail for product {product_id} "
                                    f"with quantity deducted: {total_deducted}, "
                                    f"and total price updated: {price * total_deducted}."
                                )

                            # Update the delivery issue status to resolved after processing the replacement
                            delivery_issue.STATUS = "Resolved"
                            delivery_issue.save()

                            logger.info(
                                f"Delivery issue {issue_no} status updated to resolved."
                            )

                            return Response(
                                {
                                    "message": "Replacement processed for Customer Delivery."
                                },
                                status=status.HTTP_200_OK,
                            )
                        else:
                            logger.error(
                                f"No matching outbound delivery found for delivery ID {delivery_id}."
                            )
                            return Response(
                                {
                                    "error": "No matching outbound delivery found for the delivery ID."
                                },
                                status=status.HTTP_400_BAD_REQUEST,
                            )

                elif (
                    resolution == "Replacement" and delivery_type == "Supplier Delivery"
                ):
                    # Handle Replacement for Inbound Delivery
                    issue_resolved = (
                        True  # Flag to track whether all operations succeed
                    )

                    for item in items:
                        product_id = item.get("PROD_ID")
                        quantity_to_add_back = item.get("QTY_DEFECT")
                        inbound_del_id = (
                            delivery_id  # Assuming delivery_id is already set somewhere
                        )

                        # Print the item details to verify
                        print(
                            f"Item details: PROD_ID={product_id}, QTY_DEFECT={quantity_to_add_back}, INBOUND_DEL_ID={inbound_del_id}"
                        )

                        if (
                            not product_id
                            or not quantity_to_add_back
                            or not inbound_del_id
                        ):
                            print(
                                "Missing required fields: product_id, quantity_to_add_back, or inbound_del_id."
                            )
                            return Response(
                                {
                                    "error": "Missing required product or delivery information."
                                },
                                status=status.HTTP_400_BAD_REQUEST,
                            )

                        # Fetch the inventory for this product and inbound delivery
                        inventory_batches = Inventory.objects.filter(
                            PRODUCT_ID=product_id, INBOUND_DEL_ID=inbound_del_id
                        )

                        # Print the initial inventory batches found
                        print(
                            f"Looking for inventory batches for product {product_id} and inbound delivery {inbound_del_id}. Found {inventory_batches.count()} batches."
                        )

                        if not inventory_batches.exists():
                            # If no inventory batches exist for this product and inbound delivery, create one
                            try:
                                new_inventory_entry = Inventory.objects.create(  # noqa:F841
                                    PRODUCT_ID=product_id,
                                    PRODUCT_NAME=item.get("PROD_NAME"),
                                    INBOUND_DEL_ID=inbound_del_id,
                                    BATCH_ID="AutoGeneratedBatchID",  # You can generate this or get from logic
                                    EXPIRY_DATE=None,
                                    QUANTITY_ON_HAND=quantity_to_add_back,
                                    IS_ACTIVE=True,
                                )
                                print(
                                    f"Created new inventory entry for product {product_id} with quantity {quantity_to_add_back} and inbound delivery {inbound_del_id}."
                                )
                            except Exception as e:
                                print(
                                    f"Error creating inventory entry for product {product_id}: {e}"
                                )
                                issue_resolved = (
                                    False  # Mark as not resolved if an error occurs
                                )
                        else:
                            # If inventory batches exist, update the quantity and mark as active
                            for batch in inventory_batches:
                                print(
                                    f"Found existing batch {batch.BATCH_ID} for product {product_id}. Current quantity: {batch.QUANTITY_ON_HAND}. Adding back: {quantity_to_add_back}."
                                )
                                try:
                                    batch.QUANTITY_ON_HAND += quantity_to_add_back  # Add back the defective quantity
                                    batch.IS_ACTIVE = (
                                        True  # Mark the batch as active again
                                    )
                                    batch.save()
                                    print(
                                        f"Updated inventory batch {batch.BATCH_ID} for product {product_id}. New quantity: {batch.QUANTITY_ON_HAND}, active status: {batch.IS_ACTIVE}."
                                    )
                                except Exception as e:
                                    print(f"Error saving batch {batch.BATCH_ID}: {e}")
                                    issue_resolved = (
                                        False  # Mark as not resolved if an error occurs
                                    )

                    if issue_resolved:
                        # If all operations were successful, update the issue status to Resolved
                        # Assuming you have a model for the issue and it's being tracked by `issue_id`
                        try:
                            # Assuming the issue is tracked via an ID (e.g., `issue_id` from the request)
                            delivery_issue.STATUS = (
                                "Resolved"  # Update the status to "Resolved"
                            )
                            delivery_issue.save()  # Save the updated status
                            print(
                                f"Issue {delivery_issue.ISSUE_NO} status updated to Resolved."
                            )
                        except Exception as e:
                            print(f"Error updating issue status: {e}")
                            return Response(
                                {"error": "Failed to update issue status."},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            )

                        return Response(
                            {
                                "message": "Replacement processed, inventory updated, and issue marked as resolved."
                            },
                            status=status.HTTP_200_OK,
                        )

                    else:
                        return Response(
                            {
                                "error": "An error occurred while processing the replacement or updating inventory."
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                else:
                    return Response(
                        {"error": "Invalid resolution or delivery type"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Update the delivery issue status to resolved
                delivery_issue.IS_RESOLVED = True
                delivery_issue.STATUS = "Resolved"
                delivery_issue.save()

                logger.info(f"Delivery issue {issue_no} status updated to resolved.")

        except Exception as e:
            logger.error(f"An error occurred: {str(e)}")
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {"message": "Issue resolved successfully"}, status=status.HTTP_200_OK
        )
