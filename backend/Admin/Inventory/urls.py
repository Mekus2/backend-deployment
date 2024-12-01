from django.urls import path
from .views import (
    AddProductInventoryView,
    InventoryListView,
    InventorySearchView,
)

urlpatterns = [
    path(
        "accept",
        AddProductInventoryView.as_view(),
        name="add-product-inventory",
    ),
    path(
        "<int:delivery_id>/view_details",
        AddProductInventoryView.as_view(),
        name="get-inventory-detail",
    ),
    path("list/", InventoryListView.as_view(), name="Inventory list"),
    path("list/<str:pk>/", InventoryListView.as_view(), name="Inventory list"),
    # Path for inventory search
    path("search/", InventorySearchView.as_view(), name="inventory-search"),
]
