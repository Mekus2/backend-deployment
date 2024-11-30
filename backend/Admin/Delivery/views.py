from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import (
    OutboundDelivery,
    OutboundDeliveryDetails,
    InboundDelivery,
    InboundDeliveryDetails,
)
from .serializers import (
    OutboundDeliverySerializer,
    OutboundDeliveryDetailsSerializer,
    InboundDeliverySerializer,
    InboundDeliveryDetailsSerializer,
    UpdateInboundDeliveryDetailsSerializer,
    UpdateInboundDeliverySerializer,
    CreateInboundDeliverySerializer,
    CreateInboundDeliveryDetailsSerializer,
    CreateOutboundDeliveryDetailsSerializer,
    CreateOutboundDeliverySerializer,
    UpdateInboundStatus,
)
from django.utils import timezone
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.http import Http404
from Admin.Order.Purchase.models import PurchaseOrder

import logging

logger = logging.getLogger(__name__)


class OutboundDeliveryListCreateAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        """List all Outbound Deliveries."""
        queryset = OutboundDelivery.objects.all()
        serializer = OutboundDeliverySerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Create a new Outbound Delivery with associated details."""
        data = request.data
        details_data = data.pop("details", [])  # Extract nested details data

        # Validate and create the outbound delivery
        delivery_serializer = CreateOutboundDeliverySerializer(data=data)
        if delivery_serializer.is_valid():
            with transaction.atomic():
                # Save the parent delivery
                outbound_delivery = delivery_serializer.save()

                # Validate and save the associated details
                for detail in details_data:
                    # Update the status of the related Sales(Customer) Order
                    sales_order = outbound_delivery.SALES_ORDER_ID
                    if sales_order:
                        sales_order.SALES_ORDER_STATUS = "Accepted"
                        sales_order.save()

                    detail["OUTBOUND_DEL_ID"] = outbound_delivery.OUTBOUND_DEL_ID
                    detail_serializer = CreateOutboundDeliveryDetailsSerializer(
                        data=detail
                    )
                    if detail_serializer.is_valid():
                        detail_serializer.save()
                    else:
                        # If any detail fails validation, rollback the transaction
                        return Response(
                            {
                                "error": "Invalid details data",
                                "details_errors": detail_serializer.errors,
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )

            # Return the created delivery along with its details
            return Response(delivery_serializer.data, status=status.HTTP_201_CREATED)

        return Response(delivery_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GetTotalOutboundPendingCount(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            pending_count = OutboundDelivery.objects.filter(
                OUTBOUND_DEL_STATUS="Pending"
            ).count()

            return Response({"pending_total": pending_count}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class OutboundDeliveryDetailsAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        """Retrieve specific Outbound Delivery details."""
        details = OutboundDeliveryDetails.objects.filter(OUTBOUND_DEL_ID=pk)
        if not details.exists():
            return Response(
                {"error": "Outbound Delivery details not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = OutboundDeliveryDetailsSerializer(details, many=True)
        return Response(serializer.data)

    def delete(self, request, pk):
        """Delete specific Outbound Delivery details."""
        details = OutboundDeliveryDetails.objects.filter(OUTBOUND_DEL_ID=pk)
        if not details.exists():
            return Response(
                {"error": "Outbound Delivery details not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        details.delete()
        return Response(
            {"message": "Outbound Delivery details deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )


class AcceptOutboundDeliveryAPI(APIView):
    permission_classes = [permissions.AllowAny]

    def patch(self, request, pk):
        try:
            # Start a transaction to ensure atomicity
            with transaction.atomic():
                # Fetch the OutboundDelivery by pk
                logger.debug(f"Fetching OutboundDelivery with pk: {pk}")
                outbound_delivery = get_object_or_404(OutboundDelivery, pk=pk)
                logger.debug(f"OutboundDelivery fetched: {outbound_delivery}")

                # Get the status and received date from the request data
                new_status = request.data.get("status")
                received_date = request.data.get(
                    "receivedDate"
                )  # Get the received date if provided

                if not new_status:
                    return Response(
                        {"error": "Status must be provided."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Valid statuses and logic
                if new_status == "In Transit":
                    # Check if it's a valid transition from Pending to In Transit
                    if outbound_delivery.OUTBOUND_DEL_STATUS == "Pending":
                        outbound_delivery.OUTBOUND_DEL_STATUS = "In Transit"
                        outbound_delivery.save()

                        return Response(
                            {
                                "message": "Outbound Delivery marked as In Transit successfully."
                            },
                            status=status.HTTP_200_OK,
                        )
                    else:
                        return Response(
                            {"error": "Invalid status transition."},
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                elif new_status == "Delivered":
                    # Check if it's a valid transition from In Transit to Delivered
                    if outbound_delivery.OUTBOUND_DEL_STATUS == "In Transit":
                        outbound_delivery.OUTBOUND_DEL_STATUS = "Delivered"

                        # If receivedDate is provided, use it
                        if received_date:
                            outbound_delivery.OUTBOUND_DEL_RECEIVED_DATE = received_date
                        else:
                            # Default to the current time if receivedDate is not provided
                            outbound_delivery.OUTBOUND_DEL_RECEIVED_DATE = (
                                timezone.now()
                            )

                        outbound_delivery.save()

                        # Optionally, update the related Sales Order to "Completed"
                        sales_order = outbound_delivery.SALES_ORDER_ID
                        if (
                            sales_order
                            and sales_order.SALES_ORDER_STATUS != "Completed"
                        ):
                            sales_order.SALES_ORDER_STATUS = "Completed"
                            sales_order.save()

                        return Response(
                            {
                                "message": "Outbound Delivery and Sales Order marked as Delivered successfully."
                            },
                            status=status.HTTP_200_OK,
                        )
                    else:
                        return Response(
                            {"error": "Invalid status transition."},
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                else:
                    return Response(
                        {"error": "Invalid status provided."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

        except Http404 as e:
            logger.error(f"Http404 error: {str(e)}")
            return Response(
                {"error": f"Resource not found: {str(e)}"},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return Response(
                {"error": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GetTotalInboundPendingCount(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            pending_count = InboundDelivery.objects.filter(
                INBOUND_DEL_STATUS="Pending"
            ).count()
            return Response({"pending_count": pending_count}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class InboundDeliveryPagination(PageNumberPagination):
    """
    Custom pagination class for Inbound Deliveries.
    """

    page_size = 10  # Number of records per page
    page_size_query_param = "page_size"
    max_page_size = 100


class InboundDeliveryListCreateAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # """List all Inbound Deliveries."""
        queryset = InboundDelivery.objects.all()
        serializer = InboundDeliverySerializer(queryset, many=True)
        return Response(serializer.data)

        # queryset = InboundDelivery.objects.all()
        # paginator = InboundDeliveryPagination()
        # paginated_queryset = paginator.paginate_queryset(queryset, request)
        # serializer = InboundDeliverySerializer(paginated_queryset, many=True)
        # return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        """Create a new Inbound Delivery with details."""
        print("Incoming Data:", request.data)

        # Extract inbound delivery data and associated details
        inbound_delivery_data = request.data.copy()
        details_data = inbound_delivery_data.pop("details", [])

        # Validate and save inbound delivery data
        serializer = CreateInboundDeliverySerializer(data=inbound_delivery_data)
        if serializer.is_valid():
            with transaction.atomic():
                # Save the inbound delivery
                inbound_delivery = serializer.save()

                # Validate and save the details
                detail_errors = []
                for detail in details_data:
                    # Update the status of the related Purchase Order
                    purchase_order = inbound_delivery.PURCHASE_ORDER_ID
                    if purchase_order:
                        purchase_order.PURCHASE_ORDER_STATUS = (
                            "Accepted"  # Update the status
                        )
                        purchase_order.save()

                    # Attach the INBOUND_DEL_ID to each detail
                    detail["INBOUND_DEL_ID"] = inbound_delivery.INBOUND_DEL_ID
                    detail_serializer = CreateInboundDeliveryDetailsSerializer(
                        data=detail
                    )

                    if detail_serializer.is_valid():
                        detail_serializer.save()
                    else:
                        # Collect errors for all invalid details
                        detail_errors.append(detail_serializer.errors)

                if detail_errors:
                    # Rollback if any detail is invalid
                    transaction.set_rollback(True)
                    return Response(
                        {
                            "error": "Some details are invalid.",
                            "details_errors": detail_errors,
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            # Respond with the created inbound delivery data
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        # Respond with errors for the main serializer
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InboundDeliveryRetrieveUpdateAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        # Retrieve a specific inbound delivery
        try:
            delivery = InboundDelivery.objects.get(pk=pk)
        except InboundDelivery.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = InboundDeliverySerializer(delivery)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        """Update an existing Inbound Delivery and its details."""
        try:
            # Fetch the inbound delivery instance
            inbound_delivery = InboundDelivery.objects.get(pk=pk)

            # Extract main delivery data and details data from the request
            inbound_delivery_data = request.data.get("inbound_delivery", {})
            details_data = request.data.get("details", [])

            if not inbound_delivery_data and not details_data:
                return Response(
                    {"error": "No data provided to update."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            with transaction.atomic():
                # Update the InboundDelivery instance
                if inbound_delivery_data:
                    delivery_serializer = UpdateInboundDeliverySerializer(
                        inbound_delivery, data=inbound_delivery_data, partial=True
                    )
                    if delivery_serializer.is_valid():
                        delivery_serializer.save()
                    else:
                        transaction.set_rollback(True)
                        return Response(
                            {"error": delivery_serializer.errors},
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                # Update the InboundDeliveryDetails instances
                for detail in details_data:
                    detail_id = detail.get("id")  # Ensure each detail has an ID
                    if not detail_id:
                        transaction.set_rollback(True)
                        return Response(
                            {"error": "Detail ID is required for updates."},
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                    # Fetch the detail instance and update it
                    try:
                        inbound_detail = InboundDeliveryDetails.objects.get(
                            pk=detail_id
                        )
                    except InboundDeliveryDetails.DoesNotExist:
                        transaction.set_rollback(True)
                        return Response(
                            {"error": f"Detail with ID {detail_id} not found."},
                            status=status.HTTP_404_NOT_FOUND,
                        )

                    detail_serializer = UpdateInboundDeliveryDetailsSerializer(
                        inbound_detail, data=detail, partial=True
                    )
                    if detail_serializer.is_valid():
                        detail_serializer.save()
                    else:
                        transaction.set_rollback(True)
                        return Response(
                            {"error": detail_serializer.errors},
                            status=status.HTTP_400_BAD_REQUEST,
                        )

            return Response(
                {"message": "Inbound Delivery updated successfully."},
                status=status.HTTP_200_OK,
            )

        except InboundDelivery.DoesNotExist:
            return Response(
                {"error": f"Inbound Delivery with ID {pk} not found."},
                status=status.HTTP_404_NOT_FOUND,
            )


class InboundDeliveryDetailsAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        """Retrieve specific Inbound Delivery details."""
        details = InboundDeliveryDetails.objects.filter(INBOUND_DEL_ID=pk)
        if not details.exists():
            return Response(
                {"error": "Inbound Delivery details not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = InboundDeliveryDetailsSerializer(details, many=True)
        return Response(serializer.data)

    def delete(self, request, pk):
        """Delete specific Inbound Delivery details."""
        details = InboundDeliveryDetails.objects.filter(INBOUND_DEL_ID=pk)
        if not details.exists():
            return Response(
                {"error": "Inbound Delivery details not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        details.delete()
        return Response(
            {"message": "Inbound Delivery details deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )


class UpdateInboundDelStatus(APIView):
    permission_classes = [permissions.AllowAny]

    def patch(self, request, pk):
        try:
            # Fetch the InboundDelivery instance
            inbound_delivery = InboundDelivery.objects.get(pk=pk)
        except InboundDelivery.DoesNotExist:
            return Response(
                {"error": "Inbound delivery not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Serialize and validate the incoming data
        serializer = UpdateInboundStatus(
            inbound_delivery, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()  # Save the updated status
            return Response(serializer.data, status=status.HTTP_200_OK)

        # Return validation errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
