from django.urls import path

from .views import (
    DeliveryIssueAPIView,
    DeliveryItemIssueAPIView,
    DeliveryIssueListAPI,
    ResolveIssueAPIView,
)

urlpatterns = [
    # path to get issue list
    path("issue-list/", DeliveryIssueListAPI.as_view(), name="issue_list"),
    # path to add a new delivery issue
    path("submit/", DeliveryIssueAPIView.as_view(), name="submit_issue"),
    # path to resolve issue
    path("resolve/", ResolveIssueAPIView.as_view(), name="resolve-issue"),
]
