from django.urls import path
from .views import (
    OrderListCreateAPIView,
    OrderRetrieveUpdateAPIView,
    OrderRequestDetailsAPIView,
)

urlpatterns = [
    path("", OrderListCreateAPIView.as_view(), name="order-list-create"),
    path(
        "<int:pk>/", OrderRetrieveUpdateAPIView.as_view(), name="order-retrieve-update"
    ),
    path(
        "<int:pk>/details/", OrderRequestDetailsAPIView.as_view(), name="order-details"
    ),
]
