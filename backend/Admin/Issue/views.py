from django.shortcuts import render
from django.contrib.contenttypes.models import ContentType
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import DeliveryIssue, DeliveryItemIssue
from .serializers import DeliveryIssueSerializer, DeliveryItemIssueSerializer


import logging

logger = logging.getLogger(__name__)


# Create your views here.
class DeliveryIssueAPIView(APIView):
    def get(self, request):
        """Fetch all delivery issues."""
        delivery_issues = DeliveryIssue.objects.prefetch_related("item_issues").all()
        serializer = DeliveryIssueSerializer(delivery_issues, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new delivery issue along with its items."""
        data = request.data

        # Validate and get the delivery type and ID
        delivery_type = data.get("DELIVERY_TYPE")
        delivery_id = data.get("DELIVERY_ID")

        if delivery_type and delivery_id:
            try:
                # Get the ContentType for the provided delivery type
                delivery_content_type = ContentType.objects.get(
                    model=delivery_type.lower()
                )
                data["DELIVERY_TYPE"] = delivery_content_type.id
                data["DELIVERY_ID"] = delivery_id
            except ContentType.DoesNotExist:
                return Response(
                    {"error": f"Invalid DELIVERY_TYPE: {delivery_type}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            return Response(
                {"error": "DELIVERY_TYPE and DELIVERY_ID are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Save DeliveryIssue
        serializer = DeliveryIssueSerializer(data=data)
        if serializer.is_valid():
            delivery_issue = serializer.save()

            # Create DeliveryItemIssue if present in the request data
            item_issues_data = data.get("item_issues", [])
            for item_data in item_issues_data:
                item_data["ISSUE_NO"] = delivery_issue.ISSUE_NO
                item_serializer = DeliveryItemIssueSerializer(data=item_data)
                if item_serializer.is_valid():
                    item_serializer.save()
                else:
                    return Response(
                        item_serializer.errors, status=status.HTTP_400_BAD_REQUEST
                    )

            return Response(serializer.data, status=status.HTTP_201_CREATED)

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
