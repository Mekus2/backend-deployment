from django.shortcuts import render
from django.db import transaction
from django.db.models import Sum
from django.shortcuts import get_object_or_404
import logging
from django.http import Http404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from .models import PurchaseOrder, PurchaseOrderDetails
from ...Product.models import Product
from Admin.Delivery.models import InboundDelivery, InboundDeliveryDetails
from Admin.Supplier.models import Supplier

from .serializers import (
    PurchaseOrderSerializer,
    PurchaseOrderDetailsSerializer,
    PurchaseOrderDetailsUpdateSerializer,
    PurchaseOrderUpdateSerializer,
)
from ...Supplier.utils import (
    check_supplier_exists,
    add_supplier,
    get_existing_supplier_id,
)
from ...Product.utils import get_existing_product_, check_product_exists, add_product

# Configure logging for error tracking
logger = logging.getLogger(__name__)


# Create your views here.
class PurchaseOrderListCreateView(APIView):
    permission_classes = [permissions.AllowAny]
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
        queryset = PurchaseOrder.objects.all()
        serializer = PurchaseOrderSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        print("Incoming Data:", request.data)

        # Check the order details first for product validation or creation
        purchase_order_data = request.data.copy()
        details_data = purchase_order_data.get("details", [])

        if not details_data:
            print("Warning: No order details found in the request data.")

        # Prepare a list to store created PurchaseOrderDetails instances
        order_details_to_create = []

        for detail in details_data:
            product_id = detail.get("PURCHASE_ORDER_DET_PROD_ID")
            product_name = detail.get("PURCHASE_ORDER_DET_PROD_NAME")
            quantity = detail.get("PURCHASE_ORDER_DET_PROD_LINE_QTY")

            print(f"Processing detail: {detail}")

            # If product_id is null or the product doesn't exist, use the utility function
            # Check if the product ID is provided and fetch the product, or create if necessary
            if product_id:
                # Fetch the existing product by ID
                product = Product.objects.get(id=product_id)
            else:
                print(f"No product ID found for product_name: {product_name}")

                # If product doesn't exist by name, create it
                if not check_product_exists(product_name):
                    print(f"Product does not exist, creating: {product_name}")
                    product = add_product(product_name)
                else:
                    print(f"Product exists, fetching by name: {product_name}")
                    product_id = get_existing_product_(product_name)
                    product = Product.objects.get(id=product_id)

            print(f"Using product ID: {product.id} and name: {product.PROD_NAME}")

            # Append the validated or created product to the order details to be saved
            order_details_to_create.append(
                {
                    "PURCHASE_ORDER_DET_PROD_ID": product.id,
                    "PURCHASE_ORDER_DET_PROD_NAME": product.PROD_NAME,
                    "PURCHASE_ORDER_DET_PROD_LINE_QTY": quantity,
                }
            )

        # Log the prepared order details
        print(f"Prepared order details for bulk creation: {order_details_to_create}")

        # Update purchase_order_data with the newly created order details
        purchase_order_data["details"] = (
            order_details_to_create  # Update the 'details' field with new data
        )

        # Supplier data logic remains the same
        supplier_data = {
            "Supp_Company_Name": request.data.get("PURCHASE_ORDER_SUPPLIER_CMPNY_NAME"),
            "Supp_Company_Num": request.data.get("PURCHASE_ORDER_SUPPLIER_ID"),
            "Supp_Contact_Pname": request.data.get("PURCHASE_ORDER_CONTACT_PERSON"),
            "Supp_Contact_Num": request.data.get("PURCHASE_ORDER_CONTACT_NUMBER"),
        }

        # Check if the supplier exists and add them if not
        supplier_id = None
        if supplier_data and not check_supplier_exists(supplier_data):
            print(
                f"Supplier does not exist, creating: {supplier_data['Supp_Company_Name']}"
            )
            supplier = add_supplier(supplier_data)
            supplier_id = supplier.id
        else:
            supplier_id = get_existing_supplier_id(supplier_data)

        # Update purchase order data with the supplier ID
        if supplier_id:
            purchase_order_data["PURCHASE_ORDER_SUPPLIER_ID"] = supplier_id
            print(f"Updated purchase order with supplier ID: {supplier_id}")

        # Validate the purchase order serializer
        purchase_order_serializer = PurchaseOrderSerializer(data=purchase_order_data)

        print(
            f"Serialized Purchase Order Data: {purchase_order_serializer.initial_data}"
        )
        if not purchase_order_serializer.is_valid():
            print(
                f"Purchase Order serializer errors: {purchase_order_serializer.errors}"
            )
            return Response(
                purchase_order_serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )

        # Validate and save the purchase order
        if purchase_order_serializer.is_valid():
            # Use transaction.atomic() to ensure atomicity
            with transaction.atomic():
                # Save the purchase order and its details at once using the serializer
                purchase_order = purchase_order_serializer.save()

                print(f"Purchase Order created: {purchase_order}")

                # Check if the purchase_order has an ID
                if not purchase_order.PURCHASE_ORDER_ID:
                    print("Failed to save purchase order. ID not generated.")
                    return Response(
                        {"error": "Failed to save purchase order. ID not generated."},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )

                print("PurchaseOrder and PurchaseOrderDetails created successfully.")

            return Response(
                purchase_order_serializer.data, status=status.HTTP_201_CREATED
            )

        # Log serializer errors if any
        print(
            f"Serializer errors on final validation: {purchase_order_serializer.errors}"
        )
        return Response(
            purchase_order_serializer.errors, status=status.HTTP_400_BAD_REQUEST
        )


# class PurchaseOrderListView(APIView):
#     queryset = PurchaseOrder.objects.all()
#     serializer_class = PurchaseOrderSerializer


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


class UpdatePurchaseOrderView(APIView):
    permission_classes = [permissions.AllowAny]

    def put(self, request, pk):
        try:
            # Fetch the instance of PurchaseOrder
            try:
                purchase_order = PurchaseOrder.objects.get(pk=pk)
            except PurchaseOrder.DoesNotExist:
                return Response(
                    {"detail": f"PurchaseOrder with ID {pk} does not exist."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Deserialize and validate data using the serializer
            serializer = PurchaseOrderUpdateSerializer(
                purchase_order, data=request.data, partial=True
            )
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            validated_data = serializer.validated_data

            # Handle the update process
            with transaction.atomic():
                # Update the main PurchaseOrder instance
                for field, value in validated_data.items():
                    if field != "purchase_order_details":
                        setattr(purchase_order, field, value)
                purchase_order.save()

                # Update nested details if provided
                if "purchase_order_details" in validated_data:
                    details_data = validated_data["purchase_order_details"]

                    # Use the PurchaseOrderDetailsUpdateSerializer
                    existing_details = {
                        detail.PURCHASE_ORDER_DET_ID: detail
                        for detail in purchase_order.purchase_order.all()
                    }
                    updates = []
                    creations = []

                    for detail_data in details_data:
                        detail_id = detail_data.get("PURCHASE_ORDER_DET_ID")

                        if detail_id:
                            if detail_id in existing_details:
                                # Update existing detail
                                detail_instance = existing_details.pop(detail_id)
                                detail_serializer = (
                                    PurchaseOrderDetailsUpdateSerializer(
                                        detail_instance, data=detail_data, partial=True
                                    )
                                )
                                if detail_serializer.is_valid():
                                    updates.append(detail_serializer.save())
                                else:
                                    return Response(
                                        detail_serializer.errors,
                                        status=status.HTTP_400_BAD_REQUEST,
                                    )
                            else:
                                # Create new detail if ID not found
                                creations.append(
                                    PurchaseOrderDetails(
                                        PURCHASE_ORDER_ID=purchase_order, **detail_data
                                    )
                                )
                        else:
                            # Create new detail if no ID provided
                            creations.append(
                                PurchaseOrderDetails(
                                    PURCHASE_ORDER_ID=purchase_order, **detail_data
                                )
                            )

                    # Bulk update and create
                    if updates:
                        PurchaseOrderDetails.objects.bulk_update(
                            updates,
                            [
                                "PURCHASE_ORDER_DET_PROD_ID",
                                "PURCHASE_ORDER_DET_PROD_NAME",
                                "PURCHASE_ORDER_DET_PROD_LINE_QTY",
                            ],
                        )
                    if creations:
                        PurchaseOrderDetails.objects.bulk_create(creations)

                    # Delete details not included in the update
                    for detail in existing_details.values():
                        detail.delete()

            return Response(
                {"detail": "PurchaseOrder and its details updated successfully."},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"detail": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class TransferToInboundDelivery(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, purchase_order_id):
        try:
            with transaction.atomic():  # Start the atomic transaction
                # Fetch the PurchaseOrder
                purchase_order = PurchaseOrder.objects.get(
                    PURCHASE_ORDER_ID=purchase_order_id
                )

                # Check if the status is being updated to 'Accepted'
                if request.data.get("PURCHASE_ORDER_STATUS") == "Accepted":
                    # Update the purchase order status
                    purchase_order.PURCHASE_ORDER_STATUS = "Accepted"
                    purchase_order.save()

                    accepted_by_user = request.data.get("USERNAME")

                    # Create InboundDelivery from the PurchaseOrder
                    inbound_delivery = InboundDelivery.objects.create(
                        PURCHASE_ORDER_ID=purchase_order,
                        INBOUND_DEL_SUPP_ID=purchase_order.PURCHASE_ORDER_SUPPLIER_ID,
                        INBOUND_DEL_SUPP_NAME=purchase_order.PURCHASE_ORDER_SUPPLIER_CMPNY_NAME,
                        INBOUND_DEL_TOTAL_ORDERED_QTY=purchase_order.PURCHASE_ORDER_TOTAL_QTY,
                        INBOUND_DEL_STATUS="Pending",
                        INBOUND_DEL_TOTAL_PRICE=0,  # Default value, can be updated later
                        INBOUND_DEL_ORDER_APPRVDBY_USER=accepted_by_user,
                    )

                    # Transfer PurchaseOrderDetails to InboundDeliveryDetails
                    purchase_order_details = PurchaseOrderDetails.objects.filter(
                        PURCHASE_ORDER_ID=purchase_order
                    )
                    for detail in purchase_order_details:
                        InboundDeliveryDetails.objects.create(
                            INBOUND_DEL_ID=inbound_delivery,
                            INBOUND_DEL_DETAIL_PROD_ID_id=detail.PURCHASE_ORDER_DET_PROD_ID,
                            INBOUND_DEL_DETAIL_PROD_NAME=detail.PURCHASE_ORDER_DET_PROD_NAME,
                            INBOUND_DEL_DETAIL_ORDERED_QTY=detail.PURCHASE_ORDER_DET_PROD_LINE_QTY,
                        )

                    return Response(
                        {
                            "message": "Purchase Order accepted and transferred to Inbound Delivery successfully."
                        },
                        status=status.HTTP_200_OK,
                    )

                else:
                    return Response(
                        {
                            "error": "Invalid status update. Only 'Accepted' status can trigger the transfer."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

        except PurchaseOrder.DoesNotExist:
            return Response(
                {"error": f"Purchase Order with ID {purchase_order_id} not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class PurchaseOrderUpdateAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def patch(self, request, purchase_order_id):
        try:
            with transaction.atomic():
                # Fetch the PurchaseOrder
                purchase_order = get_object_or_404(
                    PurchaseOrder, PURCHASE_ORDER_ID=purchase_order_id
                )

                # Update PurchaseOrder fields from the request data
                if supplier_id := request.data.get("PURCHASE_ORDER_SUPPLIER_ID"):
                    supplier = get_object_or_404(Supplier, id=supplier_id)
                    purchase_order.PURCHASE_ORDER_SUPPLIER_ID = supplier

                purchase_order.PURCHASE_ORDER_SUPPLIER_CMPNY_NAME = request.data.get(
                    "PURCHASE_ORDER_SUPPLIER_CMPNY_NAME",
                    purchase_order.PURCHASE_ORDER_SUPPLIER_CMPNY_NAME,
                )
                purchase_order.save()

                # Update or create InboundDelivery
                inbound_delivery, created = InboundDelivery.objects.get_or_create(
                    PURCHASE_ORDER_ID=purchase_order,
                    defaults={
                        "INBOUND_DEL_STATUS": "Pending",  # Default status
                        "INBOUND_DEL_TOTAL_ORDERED_QTY": 0,  # Will be updated later
                        "INBOUND_DEL_SUPP_ID": purchase_order.PURCHASE_ORDER_SUPPLIER_ID,
                        "INBOUND_DEL_SUPP_NAME": purchase_order.PURCHASE_ORDER_SUPPLIER_CMPNY_NAME,
                    },
                )

                if not created:
                    inbound_delivery.INBOUND_DEL_SUPP_ID = (
                        purchase_order.PURCHASE_ORDER_SUPPLIER_ID
                    )
                    inbound_delivery.INBOUND_DEL_SUPP_NAME = (
                        purchase_order.PURCHASE_ORDER_SUPPLIER_CMPNY_NAME
                    )
                    inbound_delivery.save()

                # Update PurchaseOrderDetails and InboundDeliveryDetails
                updated_details = request.data.get("details", [])
                existing_details_ids = set()

                for detail_data in updated_details:
                    prod_id = detail_data.get("PURCHASE_ORDER_DET_PROD_ID")
                    prod_name = detail_data.get("PURCHASE_ORDER_DET_PROD_NAME")
                    prod_line_qty = detail_data.get("PURCHASE_ORDER_DET_PROD_LINE_QTY")

                    product = Product.objects.get(id=prod_id)

                    # Update or create PurchaseOrderDetail
                    purchase_order_detail, _ = (
                        PurchaseOrderDetails.objects.update_or_create(
                            PURCHASE_ORDER_ID=purchase_order,
                            PURCHASE_ORDER_DET_PROD_ID=prod_id,
                            defaults={
                                "PURCHASE_ORDER_DET_PROD_NAME": prod_name,
                                "PURCHASE_ORDER_DET_PROD_LINE_QTY": prod_line_qty,
                            },
                        )
                    )
                    existing_details_ids.add(
                        purchase_order_detail.PURCHASE_ORDER_DET_ID
                    )

                    # Update or create InboundDeliveryDetail
                    InboundDeliveryDetails.objects.update_or_create(
                        INBOUND_DEL_ID=inbound_delivery,
                        INBOUND_DEL_DETAIL_PROD_ID=product,
                        defaults={
                            "INBOUND_DEL_DETAIL_PROD_NAME": prod_name,
                            "INBOUND_DEL_DETAIL_ORDERED_QTY": prod_line_qty,
                        },
                    )

                # Remove outdated details
                PurchaseOrderDetails.objects.filter(
                    PURCHASE_ORDER_ID=purchase_order
                ).exclude(PURCHASE_ORDER_DET_ID__in=existing_details_ids).delete()

                InboundDeliveryDetails.objects.filter(
                    INBOUND_DEL_ID=inbound_delivery
                ).exclude(
                    INBOUND_DEL_DETAIL_PROD_ID__in=[
                        d["PURCHASE_ORDER_DET_PROD_ID"] for d in updated_details
                    ]
                ).delete()

                # Recalculate the total quantity
                total_qty = PurchaseOrderDetails.objects.filter(
                    PURCHASE_ORDER_ID=purchase_order
                ).aggregate(total_qty=Sum("PURCHASE_ORDER_DET_PROD_LINE_QTY"))[
                    "total_qty"
                ]

                # Update the total quantity in the PurchaseOrder and InboundDelivery
                purchase_order.PURCHASE_ORDER_TOTAL_QTY = total_qty
                purchase_order.save()

                inbound_delivery.INBOUND_DEL_TOTAL_ORDERED_QTY = total_qty
                inbound_delivery.save()

                return Response(
                    {
                        "message": "Purchase Order and related Inbound Delivery updated successfully."
                    },
                    status=status.HTTP_200_OK,
                )

        except Http404 as e:
            logger.error(f"Resource not found: {str(e)}")
            raise

        except Exception as e:
            logger.error(f"An unexpected error occurred: {str(e)}")
            raise

        # except PurchaseOrder.DoesNotExist:
        #     return Response(
        #         {"error": f"Purchase Order with ID {purchase_order_id} not found."},
        #         status=status.HTTP_404_NOT_FOUND,
        #     )
        # except Exception as e:
        #     return Response(
        #         {"error": f"An error occurred: {str(e)}"},
        #         status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        #     )
