from django.db import models
from django.utils import timezone

# Model imports
from Admin.Delivery.models import InboundDelivery, OutboundDelivery
from Admin.Customer.models import Clients
from Admin.Supplier.models import Supplier


# Create your models here.
class DeliveryIssue(models.Model):
    ORDER_TYPE_CHOICES = [
        ("Supplier Delivery", "Supplier Delivery"),
        ("Customer Delivery", "Customer Delivery"),
        ("Uncategorized", "Uncategorized"),
    ]

    ISSUE_NO = models.AutoField(primary_key=True)
    ORDER_TYPE = models.CharField(
        choices=ORDER_TYPE_CHOICES, max_length=30, default="Uncategorized"
    )
    STATUS = models.CharField(
        max_length=30,
        choices=[
            ("Pending", "Pending"),
            ("Resolved", "Resolved"),
        ],
        default="Pending",
    )
    ISSUE_TYPE = models.CharField(
        max_length=30,
        choices=[
            ("Damaged", "Damaged"),
            ("Missing", "Missing Item"),
            ("Wrong Item", "Wrong Item"),
            ("Defective", "Defective"),
            ("Expired", "Expired"),
            ("Other", "Other"),
        ],
    )
    RESOLUTION = models.CharField(
        max_length=30,
        choices=[
            ("Offset", "Offset"),
            ("Replacement", "Replacement"),
        ],
        default="No Selected",
    )
    SUPPLIER_DELIVERY_ID = models.ForeignKey(
        InboundDelivery, on_delete=models.CASCADE, blank=True, null=True
    )
    SUPPLIER_ID = models.ForeignKey(
        Supplier, on_delete=models.CASCADE, blank=True, null=True
    )
    SUPPLIER_NAME = models.CharField(blank=True, null=True)
    CUSTOMER_DELIVERY_ID = models.ForeignKey(
        OutboundDelivery, on_delete=models.CASCADE, blank=True, null=True
    )
    CUSTOMER_ID = models.ForeignKey(
        Clients, on_delete=models.CASCADE, blank=True, null=True
    )
    CUSTOMER_NAME = models.CharField(max_length=60, blank=True, null=True)

    REMARKS = models.TextField(blank=True, null=True)
    IS_RESOLVED = models.BooleanField(default=False)
    DATE_CREATED = models.DateField(auto_now_add=True)


class DeliveryItemIssue(models.Model):
    ISSUE_NO = models.ForeignKey(DeliveryIssue, on_delete=models.CASCADE)
    ISSUE_PROD_ID = models.PositiveIntegerField(null=True)
    ISSUE_PROD_NAME = models.CharField(null=True)
    ISSUE_QTY_DEFECT = models.PositiveIntegerField(null=True)
    ISSUE_PROD_LINE_PRICE = models.DecimalField(
        max_digits=10, decimal_places=2, default=0
    )
    ISSUE_LINE_TOTAL_PRICE = models.DecimalField(
        max_digits=10, decimal_places=2, default=0
    )
