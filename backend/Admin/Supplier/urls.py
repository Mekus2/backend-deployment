from django.urls import path
from .views import SupplierManager, TotalSupplierCount

# new

urlpatterns = [
    path("suppliers/", SupplierManager.as_view(), name="supplier-list"),
    path("suppliers/<int:pk>/", SupplierManager.as_view(), name="supplier-detail"),

    #Path for total Suppliers
    path('totalSupplier/', TotalSupplierCount.as_view(), name='Total supplier'),
]
