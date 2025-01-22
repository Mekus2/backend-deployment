from django.urls import path

from .views import DeliveryIssueAPIView, DeliveryItemIssueAPIView, DeliveryIssueListAPI

urlpatterns = [
    # path to get issue list
    path("issue-list/", DeliveryIssueListAPI.as_view(), name="issue_list"),
    # path to add a new delivery issue
    path("submit/", DeliveryIssueAPIView.as_view(), name="submit_issue"),
]
