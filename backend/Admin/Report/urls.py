from django.urls import path
from .views import ReportAPIView

urlpatterns = [
    path('report/', ReportAPIView.as_view(), name='repoort'),
]