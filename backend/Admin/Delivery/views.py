from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
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
)
from django.db import transaction


class OutboundDeliveryListCreateAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        """List all Outbound Deliveries."""
        queryset = OutboundDelivery.objects.all()
        serializer = OutboundDeliverySerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Create a new Outbound Delivery with details."""
        serializer = OutboundDeliverySerializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                outbound_delivery = serializer.save()  # noqa:F841
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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


class InboundDeliveryListCreateAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        """List all Inbound Deliveries."""
        queryset = InboundDelivery.objects.all()
        serializer = InboundDeliverySerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Create a new Inbound Delivery with details."""
        print("Incoming Data: ", request.data)

        # Extract main inbound delivery data and details data
        inbound_delivery_data = request.data.copy()
        details_data = inbound_delivery_data.pop("details", [])

        if not details_data:
            return Response(
                {"error": "No order details provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate and save InboundDelivery data
        serializer = InboundDeliverySerializer(data=inbound_delivery_data)
        if serializer.is_valid():
            with transaction.atomic():
                # Save the inbound delivery instance
                inbound_delivery = serializer.save()

                # Prepare and save details
                for detail in details_data:
                    detail["INBOUND_DEL_ID"] = inbound_delivery.INBOUND_DEL_ID
                    detail_serializer = InboundDeliveryDetailsSerializer(data=detail)
                    if detail_serializer.is_valid():
                        detail_serializer.save()
                    else:
                        transaction.set_rollback(True)
                        return Response(
                            {"error": detail_serializer.errors},
                            status=status.HTTP_400_BAD_REQUEST,
                        )

            # Respond with the created data
            return Response(serializer.data, status=status.HTTP_201_CREATED)
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
