from django.urls import path

from .views import DeliveryIssueCreateAPIView, GetIssueListAPI

urlpatterns = [
    path(
        "submit-issue/",
        DeliveryIssueCreateAPIView.as_view(),
        name="create-issue-ticket",
    ),
    path("issue-list/", GetIssueListAPI.as_view(), name="get-issue-list"),
]
