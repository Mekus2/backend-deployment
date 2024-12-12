from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from .models import Logs
from .serializers import LogsSerializer
from Admin.authentication import CookieJWTAuthentication
from rest_framework.permissions import AllowAny


class LogsAPIView(APIView):
    """
    Handles GET (list logs), POST (create log)
    """

    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        # Fetch logs in descending order of creation date
        logs = Logs.objects.all().order_by(
            "-LOG_DATETIME"
        )  # Replace 'created_at' with the correct field name
        serializer = LogsSerializer(logs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = LogsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogsDetailAPIView(APIView):
    """
    Handles GET (retrieve log), PUT (update log), DELETE (delete log)
    """

    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [AllowAny]

    def get_object(self, pk):
        try:
            return Logs.objects.get(pk=pk)
        except Logs.DoesNotExist:
            return None

    def get(self, request, pk):
        log = self.get_object(pk)
        if not log:
            return Response(
                {"error": "Log not found"}, status=status.HTTP_404_NOT_FOUND
            )
        serializer = LogsSerializer(log)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        log = self.get_object(pk)
        if not log:
            return Response(
                {"error": "Log not found"}, status=status.HTTP_404_NOT_FOUND
            )
        serializer = LogsSerializer(log, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        log = self.get_object(pk)
        if not log:
            return Response(
                {"error": "Log not found"}, status=status.HTTP_404_NOT_FOUND
            )
        log.delete()
        return Response(
            {"message": "Log deleted successfully"}, status=status.HTTP_204_NO_CONTENT
        )


class LogsByUserAPIView(APIView):
    """
    Retrieve all logs associated with a specific user by USER_ID.
    """

    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        logs = Logs.objects.filter(USER_ID=user_id)
        if not logs.exists():
            return Response(
                {"error": "No logs found for this user"},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = LogsSerializer(logs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CustomPagination(PageNumberPagination):
    page_size = 10  # Default number of logs per page
    page_size_query_param = "page_size"
    max_page_size = 100


class UserLogsAPIView(ListAPIView):
    """
    Retrieve all logs where LOG_TYPE = 'User logs'.
    """

    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [AllowAny]
    serializer_class = LogsSerializer
    pagination_class = CustomPagination

    def get_queryset(self):
        return Logs.objects.filter(LLOG_TYPE="User logs").order_by("-LOG_DATETIME")

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not queryset.exists():
            return Response(
                {"error": "No user logs found"}, status=status.HTTP_404_NOT_FOUND
            )
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TransactionLogsAPIView(ListAPIView):
    """
    Retrieve all logs where LOG_TYPE = 'Transaction logs'.
    """

    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [AllowAny]
    serializer_class = LogsSerializer
    pagination_class = CustomPagination

    def get_queryset(self):
        return Logs.objects.filter(LLOG_TYPE="Transaction logs").order_by(
            "-LOG_DATETIME"
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not queryset.exists():
            return Response(
                {"error": "No transaction logs found"}, status=status.HTTP_404_NOT_FOUND
            )
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TotalLogs(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        total_logs = Logs.objects.count()
        return Response({total_logs}, status=status.HTTP_200_OK)
