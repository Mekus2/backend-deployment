from django.urls import path
from .views import LogsAPIView, LogsDetailAPIView, LogsByUserAPIView

urlpatterns = [
    path('logs/', LogsAPIView.as_view(), name='logs-list'),
    path('logs/<int:pk>/', LogsDetailAPIView.as_view(), name='logs-detail'),
    path('logs/user/<int:user_id>/', LogsByUserAPIView.as_view(), name='logs-by-user'),
]
