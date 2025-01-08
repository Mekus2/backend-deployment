from django.db import models

# Create your models here.
from django.conf import settings
from Admin.Customer.models import Clients
from Admin.Product.models import Product


class SalesOrder(models.Model):
    ORDER_STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Approved", "Approved"),
        ("Shipped", "Shipped"),
        ("Delivered", "Delivered"),
        ("Cancelled", "Cancelled"),
        ("Completed", "Completed"),
    ]

    # Database Fields for SALES_ORDER
    SALES_ORDER_ID = models.AutoField(primary_key=True)
    SALES_ORDER_DATE_CREATED = models.DateTimeField(auto_now_add=True)
    SALES_ORDER_DATE_UPDATED = models.DateTimeField(auto_now=True)
    SALES_ORDER_STATUS = models.CharField(
        max_length=15, choices=ORDER_STATUS_CHOICES, default="PENDING"
    )
    SALES_ORDER_CREATEDBY_USER = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=False,
        related_name="sales_orders_created",
    )
    SALES_ORDER_CLIENT_NAME = models.CharField(max_length=30, null=True, blank=False)
    SALES_ORDER_CLIENT_PROVINCE = models.CharField(
        max_length=30, null=True, blank=False
    )
    SALES_ORDER_CLIENT_CITY = models.CharField(max_length=30, null=True, blank=False)
    SALES_ORDER_CLIENT_PHONE_NUM = models.CharField(
        max_length=13, null=True, blank=False
    )
    SALES_ORDER_DLVRY_OPTION = models.CharField(
        max_length=30, null=False, blank=False, default="Standard Delivery"
    )
    SALES_ORDER_PYMNT_OPTION = models.CharField(
        max_length=30, null=False, blank=False, default="Cash On Delivery (COD)"
    )
    SALES_ORDER_PYMNT_TERMS = models.PositiveIntegerField(null=True, default=0)
    SALES_ORDER_TOTAL_QTY = models.PositiveIntegerField(null=False, default=0)
    SALES_ORDER_TOTAL_PRICE = models.DecimalField(
        null=False, max_digits=10, decimal_places=2, default=0
    )
    SALES_ORDER_TOTAL_DISCOUNT = models.DecimalField(
        null=False, max_digits=10, decimal_places=2, default=0
    )
    CLIENT_ID = models.ForeignKey(Clients, on_delete=models.CASCADE)

    def __str__(self):
        return (
            f"Customer Order #{self.SALES_ORDER_ID} for {self.SALES_ORDER_CLIENT_NAME}"
        )

    class Meta:
        db_table = "SALES_ORDER"
        verbose_name = "Sales Order"
        verbose_name_plural = "Sales Order"


class SalesOrderDetails(models.Model):
    SALES_ORDER_DET_ID = models.AutoField(primary_key=True)
    SALES_ORDER_ID = models.ForeignKey(
        SalesOrder, on_delete=models.CASCADE, null=False, related_name="sales_order"
    )
    SALES_ORDER_PROD_ID = models.ForeignKey(
        Product, null=False, on_delete=models.CASCADE
    )
    SALES_ORDER_PROD_NAME = models.CharField(max_length=50, null=False)
    SALES_ORDER_LINE_PRICE = models.DecimalField(
        max_digits=10, null=False, decimal_places=2, default=0
    )
    SALES_ORDER_LINE_QTY = models.PositiveBigIntegerField(null=False)
    SALES_ORDER_LINE_DISCOUNT = models.DecimalField(
        max_digits=10, decimal_places=2, default=0, null=False
    )
    SALES_ORDER_LINE_TOTAL = models.DecimalField(
        max_digits=10, decimal_places=2, default=0, null=False
    )

    def __str__(self):
        return f"Sales Detail ID {self.SALES_ORDER_DET_ID} for {self.SALES_ORDER_ID}"

    class Meta:
        db_table = "SALES_ORDER_DETAILS"
        verbose_name = "Sales Order Detail"
        verbose_name_plural = "Sales Order Details"
