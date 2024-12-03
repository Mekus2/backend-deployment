from rest_framework import serializers
from .models import Reports

class ReportsSerializer(serializers.ModelSerializer):
    REPORT_CREATED_USER_ID = serializers.StringRelatedField()  # Assuming you want a string representation of the user

    class Meta:
        model = Reports
        fields = [
            'REPORT_ID',
            'REPORT_TYPE',
            'REPORT_DATETIME',
            'REPORT_TITLE',
            'REPORT_DESCRIPTION',
            'REPORT_CREATED_USER_ID',
        ]
