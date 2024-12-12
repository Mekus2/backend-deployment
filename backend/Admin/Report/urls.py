from django.urls import path
from .views import ReportAPIView, DailyReportAPIView, ViewDailyReportAPIView, OutboundProductAPIView

urlpatterns = [
    path('report/', ReportAPIView.as_view(), name='report'),

    #path for daily report opening and closing
    path('dailyreport/', DailyReportAPIView.as_view(), name='Daily report'),
    
    #to view daily reports
    path('viewdaily/', ViewDailyReportAPIView.as_view(), name='View Daily'),

    path('current/', OutboundProductAPIView.as_view(), name='View Daily'),

]