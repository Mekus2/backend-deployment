from django.shortcuts import render
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import AddProductInventory
from .models import Inventory


# Create your views here.
class AddProductInventoryView(APIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]  # You can adjust the permission level

    def post(self, request):
        # Initialize the serializer with the request data
        serializer = AddProductInventory(data=request.data)

        if serializer.is_valid():  # Validate the incoming data
            # Save the valid data to the Inventory model
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            # Return an error response if the serializer is invalid
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
