from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

from django.utils import timezone

# Model imports
from Admin.Delivery.models import InboundDelivery, OutboundDelivery
from Admin.Customer.models import Clients
from Admin.Supplier.models import Supplier


# Create your models here.
class DeliveryIssue(models.Model):
    # Constants for choices
    ORDER_TYPE_CHOICES = [
        ("Supplier Delivery", "Supplier Delivery"),
        ("Customer Delivery", "Customer Delivery"),
        ("Uncategorized", "Uncategorized"),
    ]
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Resolved", "Resolved"),
    ]
    ISSUE_TYPE_CHOICES = [
        ("Damaged", "Damaged"),
        ("Missing", "Missing Item"),
        ("Wrong Item", "Wrong Item"),
        ("Defective", "Defective"),
        ("Expired", "Expired"),
        ("Other", "Other"),
    ]
    RESOLUTION_CHOICES = [
        ("Offset", "Offset"),
        ("Replacement", "Replacement"),
        ("No Selected", "No Selected"),
    ]

    # Fields
    ISSUE_NO = models.AutoField(primary_key=True)
    ORDER_TYPE = models.CharField(
        choices=ORDER_TYPE_CHOICES, max_length=30, default="Uncategorized"
    )
    STATUS = models.CharField(max_length=30, choices=STATUS_CHOICES, default="Pending")
    ISSUE_TYPE = models.CharField(max_length=30, choices=ISSUE_TYPE_CHOICES)
    RESOLUTION = models.CharField(
        max_length=30, choices=RESOLUTION_CHOICES, default="No Selected"
    )

    # Dynamic relationship using ContentType
    DELIVERY_TYPE = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True)
    DELIVERY_ID = models.PositiveIntegerField(null=True)
    DELIVERY = GenericForeignKey("DELIVERY_TYPE", "DELIVERY_ID")

    # Other fields
    REMARKS = models.TextField(blank=True, null=True)
    IS_RESOLVED = models.BooleanField(default=False)
    DATE_CREATED = models.DateField(auto_now_add=True)

    # Meta and string representation
    class Meta:
        verbose_name = "Delivery Issue"
        verbose_name_plural = "Delivery Issues"

    def __str__(self):
        return f"Issue #{self.ISSUE_NO} - {self.STATUS}"


class DeliveryItemIssue(models.Model):
    ISSUE_NO = models.ForeignKey(
        DeliveryIssue, on_delete=models.CASCADE, related_name="item_issues"
    )
    ISSUE_PROD_ID = models.PositiveIntegerField(null=True, blank=True)
    ISSUE_PROD_NAME = models.CharField(max_length=255, null=True, blank=True)
    ISSUE_QTY_DEFECT = models.PositiveIntegerField(null=True, blank=True)
    ISSUE_PROD_LINE_PRICE = models.DecimalField(
        max_digits=10, decimal_places=2, default=0
    )
    ISSUE_LINE_TOTAL_PRICE = models.DecimalField(
        max_digits=10, decimal_places=2, default=0
    )

    # Metadata
    class Meta:
        verbose_name = "Delivery Item Issue"
        verbose_name_plural = "Delivery Item Issues"

    # String representation
    def __str__(self):
        return f"Issue No: {self.ISSUE_NO}, Product: {self.ISSUE_PROD_NAME}"

    # Helper method to calculate the line total price
    def calculate_line_total(self):
        if self.ISSUE_QTY_DEFECT and self.ISSUE_PROD_LINE_PRICE:
            self.ISSUE_LINE_TOTAL_PRICE = (
                self.ISSUE_QTY_DEFECT * self.ISSUE_PROD_LINE_PRICE
            )
            self.save()
