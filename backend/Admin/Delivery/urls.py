from django.urls import path
from .views import (
    InboundDeliveryListCreateAPIView,
    InboundDeliveryDetailsAPIView,
    OutboundDeliveryDetailsAPIView,
    OutboundDeliveryListCreateAPIView,
    InboundDeliveryRetrieveUpdateAPIView,
)

urlpatterns = [
    path(
        "customer",
        OutboundDeliveryListCreateAPIView.as_view(),
        name="customer-delivery-list-create",
    ),
    path(
        "customer/<int:pk>/",
        OutboundDeliveryDetailsAPIView.as_view(),
        name="customer-delivery-details",
    ),
    path(
        "supplier",
        InboundDeliveryListCreateAPIView.as_view(),
        name="supplier-delivery-list-create",
    ),
    path(
        "supplier/<int:pk>/",
        InboundDeliveryRetrieveUpdateAPIView.as_view(),
        name="supplier-delivery-retrieve-update",
    ),
    path(
        "supplier/<int:pk>/details",
        InboundDeliveryDetailsAPIView.as_view(),
        name="supplier-delivery-details",
    ),
]
