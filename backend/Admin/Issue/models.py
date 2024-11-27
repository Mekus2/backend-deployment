from django.db import models

# Model imports
from Admin.Order.Purchase.models import PurchaseOrder
from Admin.Order.Sales_Order.models import SalesOrder
from Admin.Customer.models import Clients
from Admin.Supplier.models import Supplier


# Create your models here.
class DeliveryIssue(models.Model):
    ORDER_TYPE_CHOICES = [
        ("Purchase", "Purchase Order"),
        ("Sales", "Sales Order"),
        ("Uncategorized", "Uncategorized"),
    ]

    ISSUE_NO = models.AutoField(primary_key=True)
    ORDER_TYPE = models.CharField(
        choices=ORDER_TYPE_CHOICES, max_length=15, default="Uncategorized"
    )
    STATUS = models.CharField(
        max_length=15,
        choices=[
            ("Pending", "Pending"),
            ("Resolved", "Resolved"),
        ],
    )
    ISSUE_TYPE = models.CharField(
        max_length=15,
        choices=[
            ("Damaged", "Damaged"),
            ("Missing", "Missing Item"),
            ("Wrong Item", "Wrong Item"),
        ],
    )
    PURCHASE_ORDER_ID = models.ForeignKey(
        PurchaseOrder, on_delete=models.CASCADE, blank=True, null=True
    )
    SUPPLIER_ID = models.ForeignKey(
        Supplier, on_delete=models.CASCADE, blank=True, null=True
    )
    SUPPLIER_NAME = models.CharField(max_length=60, blank=True, null=True)
    SALES_ORDER_ID = models.ForeignKey(
        SalesOrder, on_delete=models.CASCADE, blank=True, null=True
    )
    CUSTOMER_ID = models.ForeignKey(
        Clients, on_delete=models.CASCADE, blank=True, null=True
    )
    CUSTOMER_NAME = models.CharField(max_length=60, blank=True, null=True)

    REMARKS = models.TextField(blank=True, null=True)
    IS_RESOLVED = models.BooleanField(default=False)


class DeliveryItemIssue(models.Model):
    ISSUE_NO = models.ForeignKey(DeliveryIssue, on_delete=models.CASCADE)
