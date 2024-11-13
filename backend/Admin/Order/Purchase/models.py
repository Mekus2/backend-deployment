from django.db import models

from Admin.Supplier.models import Supplier
from django.conf import settings


# Create your models here.
class PurchaseOrder(models.Model):
    PURCHASE_STATUS_CHOICES = [
        ("Dispatched", "Dispatched"),
        ("Accepted", "Accepted"),
        ("Returned", "Returned"),
        ("Cancelled", "Cancelled"),
        ("Pending", "Pending"),
    ]

    PURCHASE_ORDER_ID = models.AutoField(primary_key=True)
    PURCHASE_ORDER_STATUS = models.CharField(
        max_length=15, choices=PURCHASE_STATUS_CHOICES, default="Pending"
    )
    PURCHASE_ORDER_TOTAL_QTY = models.PositiveIntegerField(null=False, default=0)
    PURCHASE_ORDER_SUPPLIER_ID = models.ForeignKey(
        Supplier, on_delete=models.CASCADE, related_name="supplied_orders"
    )
    PURCHASE_ORDER_SUPPLIER_CMPNY_NAME = models.CharField(max_length=60, null=False)
    PURCHASE_ORDER_SUPPLIER_CMPNY_NUM = models.CharField(max_length=60, null=False)
    PURCHASE_ORDER_CONTACT_PERSON = models.CharField(max_length=60, null=False)
    PURCHASE_ORDER_CONTACT_NUMBER = models.CharField(max_length=60, null=False)
    PURCHASE_ORDER_DATE_CREATED = models.DateTimeField(auto_now_add=True)
    PURCHASE_ORDER_DATE_UPDATED = models.DateTimeField(auto_now=True)
    PURCHASE_ORDER_CREATEDBY_USER = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=False,
        related_name="purchase_orders_created",
    )

    def __str__(self):
        return f"Purchase Order ID:{self.PURCHASE_ORDER_ID} by User ID:{self.PURCHASE_ORDER_CREATEDBY_USER}"

    class Meta:
        db_table = "PURCHASE_ORDER"
        verbose_name = "Purchase Order"
        verbose_name_plural = "Purchase Orders"


class PurchaseOrderDetails(models.Model):
    PURCHASE_ORDER_DET_ID = models.AutoField(primary_key=True)
    PURCHASE_ORDER_DET_PROD_ID = models.IntegerField(null=False)
    PURCHASE_ORDER_DET_PROD_NAME = models.CharField(max_length=60, null=False)
    PURCHASE_ORDER_ID = models.ForeignKey(
        PurchaseOrder, on_delete=models.CASCADE, related_name="purchase_order"
    )

    def __str__(self):
        return f"Purchase Order Detail ID:{self.PURCHASE_ORDER_DET_ID} for Order ID{self.PURCHASE_ORDER_ID}"

    class Meta:
        db_table = "PURCHASE_ORDER_DETAILS"
        verbose_name = "Purchase Order Detail"
        verbose_name_plural = "Purchase Order Details"
