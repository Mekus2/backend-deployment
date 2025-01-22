from django.urls import path
from .views import (
    PurchaseOrderListCreateView,
    PurchaseOrderDetailView,
    TransferToInboundDelivery,
    PurchaseOrderUpdateAPIView,
    PurchaseOrderCancelAPIView,
    DailyPurchaseOrdersView,
)

urlpatterns = [
    path("", PurchaseOrderListCreateView.as_view(), name="purchase-order-list-create"),
    path(
        "<int:pk>/details",
        PurchaseOrderDetailView.as_view(),
        name="purchase-order-list",
    ),
    path(
        "<int:purchase_order_id>/accept/",
        TransferToInboundDelivery.as_view(),
        name="accept-purchase-order",
    ),
    # Path for updating a purchase order details
    path(
        "<int:purchase_order_id>/update/",
        PurchaseOrderUpdateAPIView.as_view(),
        name="update-purchase_order",
    ),
    path(
        "<int:purchase_order_id>/cancel/",
        PurchaseOrderCancelAPIView.as_view(),
        name="cancel-purchase_order",
    ),
    #For purchase order report
    path(
        "purchaseOrder/",
        DailyPurchaseOrdersView.as_view(),
        name="daily purchase order",
    ),
    

]
