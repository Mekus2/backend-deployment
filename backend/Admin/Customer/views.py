from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from .models import Clients
from .serializers import ClientManager
from Admin.authentication import CookieJWTAuthentication
from Admin.AdminPermission import IsAdminUser


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
    permission_classes = [AllowAny]  # Modify this to IsAdminUser if admin access is required

    def get(self, request):
        # Get the total number of clients
        total_clients = Clients.objects.count()
        return Response({ total_clients}, status=status.HTTP_200_OK)