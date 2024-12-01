from django.urls import path

from .views import DeliveryIssueCreateAPIView

urlpatterns = [
    path("issue/", DeliveryIssueCreateAPIView.as_view(), name="create-issue-ticket")
]
