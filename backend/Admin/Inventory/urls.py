from django.urls import path
from .views import AddProductInventoryView

urlpatterns = [
    path("", AddProductInventoryView.as_view(), name="add-product-inventory"),
    path(
        "<int:delivery_id>/",
        AddProductInventoryView.as_view(),
        name="get-inventory-detail",
    ),
]
