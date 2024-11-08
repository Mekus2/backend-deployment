from django.urls import path
from .views import (
    SalesOrderListCreateAPIView,
    SalesOrderDetailsAPIView,
    SalesOrderRetrieveUpdateAPIView,
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
]
