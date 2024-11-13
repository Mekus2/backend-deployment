from django.urls import path
from .views import (
    PurchaseOrderListCreateView,
    PurchaseOrderListView,
    PurchaseOrderDetailView,
)

urlpattern = [
    path("", PurchaseOrderListCreateView.as_view(), name="purchase-order-list-create"),
    path(
        "<int:pk>/details",
        PurchaseOrderDetailView.as_view(),
        name="purchase-order-list",
    ),
]
