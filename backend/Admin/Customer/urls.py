from django.urls import path
from .views import ClientListManager, TotalClientsCount, GetClientsWithBalance

urlpatterns = [
    path(
        "clients/", ClientListManager.as_view(), name="client-list"
    ),  # For listing all clients
    path(
        "clients/<int:pk>/", ClientListManager.as_view(), name="client-detail"
    ),  # For retrieving, updating, deleting a single client by ID (pk)
    path("totalClients/", TotalClientsCount.as_view(), name="totalClients"),
    # to retrieve custmer and their balance
    path(
        "client-balance/", GetClientsWithBalance.as_view(), name="client-balance-list"
    ),
]
