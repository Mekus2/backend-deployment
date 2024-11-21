from django.urls import path
from .views import AddProductInventoryView

urlpatterns = [path("", AddProductInventoryView.as_view(), name="add-inventory")]
