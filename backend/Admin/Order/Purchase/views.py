from django.shortcuts import render
from django.db import transaction

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import PurchaseOrder, PurchaseOrderDetails
from .serializers import PurchaseOrderSerializer, PurchaseOrderDetailsSerializer
from ...Supplier.utils import (
    check_supplier_exists,
    add_supplier,
    get_existing_supplier_id,
)


# Create your views here.
class PurchaseOrderListCreateView(APIView):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Save the purchase order and its details
        self.perform_create(serializer)

        # Customize response to include the saved data
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def get(self, request):
        queryset = PurchaseOrder.object.all()
        serializer = PurchaseOrderSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        print("Incoming Data:", request.data)
        purchase_order_serializer = PurchaseOrderSerializer(data=request.data)

        supplier_data = {
            "Supp_Company_Name": request.data.get("PURCHASE_ORDER_SUPPLIER_CMPNY_NAME"),
            "Supp_Company_Num": request.data.get("PURCHASE_ORDER_SUPPLIER_ID"),
            "Supp_Contact_Pname": request.data.get("PURCHASE_ORDER_CONTACT_PERSON"),
            "Supp_Contact_Num": request.data.get("PURCHASE_ORDER_CONTACT_NUMBER"),
        }

        # Check if the supplier exists and add them if not
        supplier_id = None
        if supplier_data and not check_supplier_exists(supplier_data):
            supplier = add_supplier(supplier_data)
            supplier_id = supplier.id
        else:
            supplier_id = get_existing_supplier_id(supplier_data)

        # Update purchase order data with the supplier ID
        if supplier_id:
            purchase_order_data = request.data.copy()
            purchase_order_data["PURCHASE_ORDER_SUPPLIER_ID"] = supplier_id
            purchase_order_serializer = PurchaseOrderSerializer(
                data=purchase_order_data
            )

        if purchase_order_serializer.is_valid():
            # Use transaction.atomic() to ensure atomicity
            with transaction.atomic():
                # Save the purchase order
                purchase_order = purchase_order_serializer.save()  # noqa:F841
            return Response(
                purchase_order_serializer.data, status=status.HTTP_201_CREATED
            )

        print("Serializer errors:", purchase_order_serializer.errors)
        return Response(
            purchase_order_serializer.errors, status=status.HTTP_400_BAD_REQUEST
        )


class PurchaseOrderListView(APIView):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer


class PurchaseOrderDetailView(APIView):
    # Permissions
    permission_classes = [permissions.AllowAny]
    # Query Set and Serializer
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderDetails

    def get(self, request, pk):
        details = PurchaseOrderDetails.objects.filter(PURCHASE_ORDER_ID=pk)
        if not details.exists():
            return Response(
                {"Error:": "Purchase Order not Found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = PurchaseOrderDetailsSerializer(details, many=True)
        return Response(serializer.data)
