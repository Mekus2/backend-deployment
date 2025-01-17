from django.urls import path

from .views import DeliveryIssueAPIView, DeliveryItemIssueAPIView

urlpatterns = [
    # path to add a new delivery issue
    path("submit/", DeliveryIssueAPIView.as_view(), name="submit_issue"),
]
