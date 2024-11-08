from django.db import models

# from django.contrib.auth.models import User
from django.conf import settings


# Create your models here.
class OrderRequest(models.Model):
    ORDER_STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Approved", "Approved"),
        ("Shipped", "Shipped"),
        ("Delivered", "Delivered"),
        ("Cancelled", "Cancelled"),
    ]

    # Database Fields for ORDER_REQUEST TABLE
    ORDER_ID = models.AutoField(primary_key=True)
    ORDER_DATE_CREATED = models.DateTimeField(auto_now_add=True)
    ORDER_DATE_UPDATED = models.DateTimeField(auto_now=True)
    ORDER_STATUS = models.CharField(
        max_length=15, choices=ORDER_STATUS_CHOICES, default="PENDING"
    )
    ORDER_CREATEDBY_USER = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders_created",
    )
    CLIENT_ID = models.IntegerField(null=True, blank=False)

    def __str__(self):
        return f"Order {self.ORDER_ID} - Status: {self.ORDER_STATUS}"

    class Meta:
        db_table = "ORDER_REQUEST"
        verbose_name = "Order Request"
        verbose_name_plural = "Order Requests"


class OrderRequestDetails(models.Model):

    ORDER_REQ_DETAILS_ID = models.AutoField(primary_key=True)
    ORDER_REQ_PRODUCT_ID = models.IntegerField(
        null=True, blank=True
    )  # Placeholder field for Product ID, change to Fk later
    ORDER_REQ_PRODUCT_NAME = models.CharField(max_length=50, null=False, blank=False)
    ORDER_REQ_QTY = models.PositiveIntegerField(null=False)
    ORDER_REQ_PRICE = models.DecimalField(
        null=False, max_digits=10, decimal_places=2, default=0
    )
    ORDER_REQ_LINE_TOTAL = models.DecimalField(
        null=False, max_digits=10, decimal_places=2, default=0
    )
    ORDER_REQ_SUB_TOTAL = models.DecimalField(
        null=False, decimal_places=2, max_digits=10, default=0
    )
    ORDER_ID = models.ForeignKey(
        OrderRequest, on_delete=models.CASCADE, related_name="order_details"
    )

    def __str__(self) -> str:
        return f"Product {self.ORDER_REQ_PRODUCT_NAME} (Qty: {self.ORDER_REQ_QTY})"  # noqa:E501

    class Meta:
        db_table = "ORDER_REQUEST_DETAILS"
        verbose_name = "Order Request Detail"
        verbose_name_plural = "Order Request Details"
