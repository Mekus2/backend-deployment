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
