from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from .models import Clients
from .serializers import ClientManager
from Admin.authentication import CookieJWTAuthentication
from Admin.AdminPermission import IsAdminUser
from Admin.Sales.models import CustomerPayment
from django.db.models import Sum


class ClientListManager(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [AllowAny]

    def get(self, request, pk=None):
        if pk:
            # Retrieve a single client by its pk
            client = get_object_or_404(Clients, pk=pk)
            serializer = ClientManager(client)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            # Retrieve all clients if no pk is provided
            clients = Clients.objects.all()
            serializer = ClientManager(clients, many=True)
            return Response(serializer.data)

    def post(self, request):
        serializer = ClientManager(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        """Update a client record by its ID (pk)."""
        client = get_object_or_404(Clients, pk=pk)
        serializer = ClientManager(client, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Delete a client record by its ID (pk)."""
        client = get_object_or_404(Clients, pk=pk)
        client.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TotalClientsCount(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [
        AllowAny
    ]  # Modify this to IsAdminUser if admin access is required

    def get(self, request):
        # Get the total number of clients
        total_clients = Clients.objects.count()
        return Response({total_clients}, status=status.HTTP_200_OK)


class GetClientsWithBalance(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # Fetch all clients
        clients = Clients.objects.all()

        # Prepare a list to hold client details and their balance
        client_data = []

        for client in clients:
            # Get client details
            client_id = client.id
            client_name = client.name
            client_address = client.address
            client_province = client.province
            client_phone = client.phoneNumber

            # Calculate the total unpaid or partially paid balance for each customer
            unpaid_balance = (
                CustomerPayment.objects.filter(
                    CLIENT_ID=client, PAYMENT_STATUS__in=["Unpaid", "Partially Paid"]
                ).aggregate(total_balance=Sum("AMOUNT_BALANCE"))["total_balance"]
                or 0
            )

            # Append client data and balance to the list
            client_data.append(
                {
                    "id": client_id,
                    "name": client_name,
                    "address": client_address,
                    "province": client_province,
                    "phoneNumber": client_phone,
                    "balance": unpaid_balance,
                }
            )

        # Return the list of clients and their balances
        return Response({"clients": client_data}, status=200)
