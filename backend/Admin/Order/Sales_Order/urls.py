from django.urls import path
from .views import (
    SalesOrderListCreateAPIView,
    SalesOrderDetailsAPIView,
    SalesOrderRetrieveUpdateAPIView,
    GetPendingTotalView,
    TransferToOutboundDelivery,
    SalesOrderUpdateAPIView,
)

urlpatterns = [
    path("", SalesOrderListCreateAPIView.as_view(), name="sales-order-list-create"),
    path(
        "<int:pk>/",
        SalesOrderRetrieveUpdateAPIView.as_view(),
        name="sales-order-retrieve-update",
    ),
    path(
        "<int:pk>/details/",
        SalesOrderDetailsAPIView.as_view(),
        name="sales-order-details",
    ),
    path("total-orders", GetPendingTotalView.as_view(), name="get-total-orders"),
    path(
        "<int:sales_order_id>/accept/",
        TransferToOutboundDelivery.as_view(),
        name="accept-sales-order",
    ),
    path(
        "update/<int:sales_order_id>",
        SalesOrderUpdateAPIView.as_view(),
        name="update-sales-order",
    ),
]
