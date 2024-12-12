from django.db import models
from Admin.Delivery.models import InboundDelivery, OutboundDelivery
from Admin.Product.models import Product # Ensure Product model is imported correctly
from Account.models import User  # Ensure correct import for the User model

class Reports(models.Model):
    REPORT_ID = models.AutoField(primary_key=True)
    REPORT_TYPE = models.CharField(max_length=60, null=False)
    REPORT_DATETIME = models.DateTimeField(null=True, blank=True)
    REPORT_TITLE = models.CharField(max_length=60, null=False)
    REPORT_DESCRIPTION = models.TextField()  # Allows for longer descriptions
    # Uncomment this if user tracking is needed
    # REPORT_CREATED_USER_ID = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"Report #{self.REPORT_ID} - {self.REPORT_TITLE}"


class ReportDetails(models.Model):
    report = models.ForeignKey(Reports, on_delete=models.CASCADE, related_name='details')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    opening_stock = models.IntegerField(default=0)  # Static opening stock
    current_stock = models.IntegerField(default=0)  # Current stock after deductions
    outbound_quantity = models.IntegerField(default=0)  # Quantity shipped or sold

    def __str__(self):
        return f"Details for Report #{self.report.REPORT_ID} - Product {self.product.PROD_NAME}"
