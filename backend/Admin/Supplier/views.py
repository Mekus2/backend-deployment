from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from .models import Supplier
from .serializers import CreateSupplierSerializer, SupplierSerializer
from Admin.authentication import CookieJWTAuthentication
from Admin.AdminPermission import IsAdminUser


class SupplierManager(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [AllowAny]

    # new
    def get(self, request, pk=None):
        if pk:
            # Retrieve a single supplier by its pk
            supplier = get_object_or_404(Supplier, pk=pk)
            serializer = SupplierSerializer(supplier)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            # Retrieve all suppliers if no pk is provided
            suppliers = Supplier.objects.all()
            serializer = SupplierSerializer(suppliers, many=True)
            return Response(serializer.data)

    def post(self, request):
        """Create a new supplier"""
        serializer = CreateSupplierSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        """Update an existing supplier by its ID (pk)"""
        supplier = get_object_or_404(Supplier, pk=pk)
        serializer = CreateSupplierSerializer(supplier, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Delete a supplier by its ID (pk)"""
        supplier = get_object_or_404(Supplier, pk=pk)
        supplier.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TotalSupplierCount(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):

        total_supplier = Supplier.objects.count()
        return Response({total_supplier}, status=status.HTTP_200_OK)
