from django.urls import path
from .views import SupplierManager

# new

urlpatterns = [
    path("suppliers/", SupplierManager.as_view(), name="supplier-list"),
    path("suppliers/<int:pk>/", SupplierManager.as_view(), name="supplier-detail"),
]
