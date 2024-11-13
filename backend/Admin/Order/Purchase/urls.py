from django.urls import path
from .views import (
    PurchaseOrderListCreateView,
    PurchaseOrderDetailView,
)

urlpatterns = [
    path("", PurchaseOrderListCreateView.as_view(), name="purchase-order-list-create"),
    path(
        "<int:pk>/details",
        PurchaseOrderDetailView.as_view(),
        name="purchase-order-list",
    ),
]
