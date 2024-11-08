from django.urls import path
from .views import ClientListManager

urlpatterns = [
    path(
        "clients/", ClientListManager.as_view(), name="client-list"
    ),  # For listing all clients
    path(
        "clients/<int:pk>/", ClientListManager.as_view(), name="client-detail"
    ),  # For retrieving, updating, deleting a single client by ID (pk)
]
