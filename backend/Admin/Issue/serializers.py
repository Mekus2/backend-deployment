from rest_framework import serializers
from .models import DeliveryIssue, DeliveryItemIssue


class DeliveryItemIssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryItemIssue
        fields = "__all__"


class DeliveryIssueSerializer(serializers.ModelSerializer):
    item_issues = DeliveryItemIssueSerializer(many=True, read_only=True)

    class Meta:
        model = DeliveryIssue
        fields = "__all__"
