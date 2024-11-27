from django.urls import path
from .views import (
    PurchaseOrderListCreateView,
    PurchaseOrderDetailView,
    TransferToInboundDelivery,
    PurchaseOrderUpdateAPIView,
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
    path(
        "<int:purchase_order_id>/update/",
        PurchaseOrderUpdateAPIView.as_view(),
        name="update-purchase_order",
    ),
]
