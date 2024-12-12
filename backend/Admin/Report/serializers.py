from rest_framework import serializers
from .models import Reports, ReportDetails
from Admin.Product.models import Product  # Ensure Product model is imported correctly

class ReportDetailsSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.PROD_NAME', read_only=True)  # Display product name

    class Meta:
        model = ReportDetails
        fields = [
            'id',  # Auto-generated ID for details
            'product',  # Foreign key (ID)
            'product_name',  # Read-only product name
            'opening_stock',
            'current_stock',
            'outbound_quantity',
        ]


class ReportsSerializer(serializers.ModelSerializer):
    details = ReportDetailsSerializer(many=True, read_only=True)  # Nested serialization for report details
    REPORT_CREATED_USER_ID = serializers.StringRelatedField()  # Assuming a string representation of the user

    class Meta:
        model = Reports
        fields = [
            'REPORT_ID',
            'REPORT_TYPE',
            'REPORT_DATETIME',
            'REPORT_TITLE',
            'REPORT_DESCRIPTION',
            'REPORT_CREATED_USER_ID',  # Uncomment if user tracking is enabled
            'details',  # Nested details
        ]
