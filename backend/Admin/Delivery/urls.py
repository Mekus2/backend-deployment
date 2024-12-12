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
    CompleteOutboundDeliveryAPI,
    DeliveredOutboundDeliveryView,
    InboundDeliveryTodayAPIView,
    InboundDeliveryDateRangeAPIView,
    OutboundDeliveryTodayAPIView,
    OutboundDeliveryDateRangeAPIView,
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
    path(
        "customer/<int:pk>/create-invoice/",
        CompleteOutboundDeliveryAPI.as_view(),
        name="complete-delivery-add-sales",
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
    # Path for all delivered
    path(
        "customer/delivered",
        DeliveredOutboundDeliveryView.as_view(),
        name="Delivered",
    ),




    #REPORT SUPPLIER
    path(
        "supplier/date",
        InboundDeliveryTodayAPIView.as_view(),
        name="Delivered",
    ),
    path(
        "supplier/dateRange/",
        InboundDeliveryDateRangeAPIView.as_view(),
        name="supplier-delivery-date-range",  # A new name for the date range filter
    ),

     #REPORT CUSTOMER
    path(
        "customer/date",
        OutboundDeliveryTodayAPIView.as_view(),
        name="Delivered",
    ),
    path(
        "customer/dateRange/",
        OutboundDeliveryDateRangeAPIView.as_view(),
        name="supplier-delivery-date-range",  # A new name for the date range filter
    ),

    
]
