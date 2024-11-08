from django.shortcuts import render
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action

from .serializers import (
    OrderRequestSerializer,
    OrderRequestDetailsSerializer,
    OrderRequestListSerializer,
)
from .models import OrderRequest, OrderRequestDetails


class OrderListCreateAPIView(APIView):
    """
    Handle listing all Order Requests and creating a new Order Request.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        """List all Order Requests without their details."""
        # Fetch only Order Requests without referencing order details
        queryset = OrderRequest.objects.all()

        # Use the new serializer for listing
        serializer = OrderRequestListSerializer(queryset, many=True)

        return Response(serializer.data)

    def post(self, request):
        """Create a new Order Request along with its details."""
        print("Incoming request data:", request.data)  # Log incoming request data
        order_serializer = OrderRequestSerializer(data=request.data)

        if order_serializer.is_valid():
            print("Serializer is valid, proceeding to save.")  # Log success
            order_request = order_serializer.save()  # noqa:F841
            return Response(order_serializer.data, status=status.HTTP_201_CREATED)

        print("Serializer errors:", order_serializer.errors)  # Log errors if invalid
        return Response(order_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OrderRetrieveUpdateAPIView(APIView):
    """
    Handle retrieving a specific Order Request and updating it.
    """

    permission_classes = [permissions.AllowAny]

    def get_object(self, pk):
        try:
            return OrderRequest.objects.prefetch_related("order_details").get(
                ORDER_ID=pk
            )
        except OrderRequest.DoesNotExist:
            return None

    def get(self, request, pk):
        """Retrieve a specific Order Request and its details."""
        order = self.get_object(pk)
        if not order:
            return Response(
                {"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = OrderRequestSerializer(order)
        return Response(serializer.data)

    def patch(self, request, pk):
        """Partially update an Order Request."""
        order = self.get_object(pk)
        if not order:
            return Response(
                {"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = OrderRequestSerializer(order, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OrderRequestDetailsAPIView(APIView):
    """
    Handle operations for Order Request Details.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        """Retrieve details for a specific Order Request."""
        details = OrderRequestDetails.objects.filter(ORDER_ID=pk)
        if not details.exists():
            return Response(
                {"error": "Order details not found."}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = OrderRequestDetailsSerializer(details, many=True)
        return Response(serializer.data)

    def delete(self, request, pk):
        """Delete details for a specific Order Request."""
        details = OrderRequestDetails.objects.filter(ORDER_ID=pk)
        if not details.exists():
            return Response(
                {"error": "Order details not found."}, status=status.HTTP_404_NOT_FOUND
            )

        details.delete()
        return Response(
            {"message": "Order details deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )
