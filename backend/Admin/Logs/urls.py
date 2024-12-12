from django.urls import path
from .views import LogsAPIView, LogsDetailAPIView, LogsByUserAPIView,UserLogsAPIView, TransactionLogsAPIView, TotalLogs
TotalLogs,

urlpatterns = [
    path('logs/', LogsAPIView.as_view(), name='logs-list'),
    path('logs/<int:pk>/', LogsDetailAPIView.as_view(), name='logs-detail'),
    path('logs/user/<int:user_id>/', LogsByUserAPIView.as_view(), name='logs-by-user'),
    path('logs/user/', UserLogsAPIView.as_view(), name='user-logs'),
    path('logs/transaction/', TransactionLogsAPIView.as_view(), name='transaction-logs'),

    #Path for total logs:
    path('total/', TotalLogs.as_view(), name='totallogs'),
]
