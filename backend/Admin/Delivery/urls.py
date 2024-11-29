from django.urls import path
from .views import (
    InboundDeliveryListCreateAPIView,
    InboundDeliveryDetailsAPIView,
    OutboundDeliveryDetailsAPIView,
    OutboundDeliveryListCreateAPIView,
    InboundDeliveryRetrieveUpdateAPIView,
    UpdateInboundDelStatus,
    GetTotalOutboundPendingCount,
    GetTotalInboundPendingCount,
    AcceptOutboundDeliveryAPI,
)

urlpatterns = [
    # Customer Delivery Paths
    path(
        "customer",
        OutboundDeliveryListCreateAPIView.as_view(),
        name="customer-delivery-list-create",
    ),
    path(
        "customer/<int:pk>/details",
        OutboundDeliveryDetailsAPIView.as_view(),
        name="customer-delivery-details",
    ),
    path(
        "customer/<int:pk>/accept",
        AcceptOutboundDeliveryAPI.as_view(),
        name="dispatch-delivery",
    ),
    # Supplier Delivery paths
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
    path(
        "supplier/<int:pk>/update",
        UpdateInboundDelStatus.as_view(),
        name="update-inbound-status",
    ),
    # Path for fetching Total Orders for both
    path(
        "customer/total-orders",
        GetTotalOutboundPendingCount.as_view(),
        name="total-customer-pending",
    ),
    path(
        "supplier/total-orders",
        GetTotalInboundPendingCount.as_view(),
        name="total-supplier-pending",
    ),
]
