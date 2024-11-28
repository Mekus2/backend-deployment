# Create your models here.
from django.db import models
from Admin.Order.Sales_Order.models import SalesOrder
from Admin.Order.Purchase.models import PurchaseOrder
from Admin.Supplier.models import Supplier
from Admin.Product.models import Product
from Admin.Customer.models import Clients
from django.conf import settings
from django.utils.text import slugify
from django.utils import timezone


# Create your models here.
class OutboundDelivery(models.Model):
    DELIVERY_STATUS_CHOICES = [
        ("Dispatched", "Dispatched"),
        ("Accepted", "Accepted"),
        ("Returned", "Returned"),
        ("Cancelled", "Cancelled"),
        ("Pending", "Pending"),
        ("Delivered", "Delivered"),
    ]

    OUTBOUND_DEL_ID = models.AutoField(primary_key=True)
    SALES_ORDER_ID = models.ForeignKey(SalesOrder, on_delete=models.CASCADE)
    OUTBOUND_DEL_SHIPPED_DATE = models.DateTimeField(
        auto_now=True, null=True, blank=True
    )
    OUTBOUND_DEL_CSTMR_RCVD_DATE = models.DateTimeField(
        auto_now=True, null=True, blank=True
    )
    CLIENT_ID = models.ForeignKey(
        Clients, on_delete=models.SET_NULL, null=True
    )  # Customer ID
    OUTBOUND_DEL_CUSTOMER_NAME = models.CharField(max_length=60, null=False)
    OUTBOUND_DEL_TOTAL_PRICE = models.DecimalField(
        max_digits=10, decimal_places=2, default=0
    )
    OUTBOUNND_DEL_DISCOUNT = models.DecimalField(
        max_digits=10, decimal_places=2, default=0
    )
    OUTBOUND_DEL_STATUS = models.CharField(
        max_length=15, choices=DELIVERY_STATUS_CHOICES, default="Pending"
    )
    OUTBOUND_DEL_TOTAL_ORDERED_QTY = models.PositiveIntegerField(
        null=False, default=0
    )  # Qty based on sales order
    OUTBOUND_DEL_DLVRD_QTY = models.PositiveIntegerField(
        null=False, default=0
    )  # Accepted Qty
    OUTBOUND_DEL_DLVRY_OPTION = models.CharField(
        max_length=30, null=False, blank=False, default="Standard Delivery"
    )
    OUTBOUND_DEL_CITY = models.CharField(max_length=30, null=True, blank=False)
    OUTBOUND_DEL_PROVINCE = models.CharField(max_length=30, null=True, blank=False)
    OUTBOUND_DEL_CREATED = models.DateTimeField(auto_now_add=True)
    OUTBOUND_DEL_DATEUPDATED = models.DateTimeField(auto_now=True)
    OUTBOUND_DEL_ACCPTD_BY_USER = models.CharField(
        max_length=60, null=False, default="Admin"
    )
    # OUTBOUND_DEL_CREATEDBY_USER_ID = models.ForeignKey(
    #     settings.AUTH_USER_MODEL,
    #     on_delete=models.CASCADE,
    #     null=True,
    #     related_name="customer_deliveries_created",
    # )

    def __str__(self):
        return f"Customer Delivery #{self.OUTBOUND_DEL_ID} for {self.OUTBOUND_DEL_CUSTOMER_NAME}"

    class Meta:
        db_table = "OUTBOUND_DELIVERY"
        verbose_name = "Outbound Delivery"
        verbose_name_plural = "Outbound Deliveries"


class OutboundDeliveryDetails(models.Model):
    OUTBOUND_DEL_DETAIL_ID = models.AutoField(primary_key=True)
    OUTBOUND_DEL_ID = models.ForeignKey(OutboundDelivery, on_delete=models.CASCADE)
    OUTBOUND_DETAILS_PROD_ID = models.ForeignKey(
        Product, on_delete=models.CASCADE, null=True
    )
    OUTBOUND_DETAILS_PROD_NAME = models.CharField(max_length=100, null=False)
    OUTBOUND_DETAILS_PROD_QTY = models.PositiveIntegerField(null=False, default="0")
    OUTBOUND_DETAILS_SELL_PRICE = models.DecimalField(
        null=False, max_digits=10, decimal_places=2, default=0
    )
    OUTBOUND_DETAIL_LINE_TOTAL = models.DecimalField(
        null=True, max_digits=10, decimal_places=2, default=0
    )

    def __str__(self):
        return f"Customer Delivery Detail #{self.OUTBOUND_DETAILS_ID} for Delivery No.{self.OUTBOUND_DEL_ID}"

    class Meta:
        db_table = "OUTBOUND_DELIVERY_DETAILS"
        verbose_name = "Outbound Delivery Detail"
        verbose_name_plural = "Outbound Delivery Details"


class InboundDelivery(models.Model):
    INBOUND_DELIVERY_STATUS_CHOICES = [
        ("Dispatched", "Dispatched"),
        ("Accepted", "Accepted"),
        ("Returned", "Returned"),
        ("Cancelled", "Cancelled"),
        ("Pending", "Pending"),
        ("Delivered", "Delivered"),
    ]

    INBOUND_DEL_ID = models.AutoField(primary_key=True)
    INBOUND_DEL_ORDER_DATE_CREATED = models.DateTimeField(auto_now_add=True)
    INBOUND_DEL_ORDER_DATE_UPDATED = models.DateTimeField(auto_now=True)
    PURCHASE_ORDER_ID = models.ForeignKey(
        PurchaseOrder, on_delete=models.CASCADE, null=True
    )
    INBOUND_DEL_SUPP_ID = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    INBOUND_DEL_SUPP_NAME = models.CharField(max_length=50, null=True, blank=True)
    INBOUND_DEL_DATE_DELIVERED = models.DateTimeField(null=True, blank=True)
    INBOUND_DEL_STATUS = models.CharField(
        max_length=15, choices=INBOUND_DELIVERY_STATUS_CHOICES, default="Pending"
    )
    INBOUND_DEL_TOTAL_RCVD_QTY = models.PositiveIntegerField(null=True, default=0)
    INBOUND_DEL_TOTAL_ORDERED_QTY = models.PositiveIntegerField(null=False, default=0)
    INBOUND_DEL_TOTAL_PRICE = models.DecimalField(
        max_digits=10, default=0, decimal_places=2, null=True
    )
    INBOUND_DEL_RCVD_BY_USER_NAME = models.CharField(max_length=60, null=True)
    INBOUND_DEL_ORDER_APPRVDBY_USER = models.CharField(
        max_length=60, null=False, default="Admin"
    )

    def __str__(self):
        return (
            f"Supply Delivery #{self.INBOUND_DEL_ID} from {self.INBOUND_DEL_SUPP_NAME}"
        )

    class Meta:
        db_table = "INBOUND_DELIVERY"
        verbose_name = "Inbound Delivery"
        verbose_name_plural = "Inbound Deliveries"


class InboundDeliveryDetails(models.Model):

    INBOUND_DEL_DETAIL_ID = models.AutoField(primary_key=True)
    INBOUND_DEL_ID = models.ForeignKey(InboundDelivery, on_delete=models.CASCADE)
    INBOUND_DEL_DETAIL_PROD_ID = models.ForeignKey(
        Product, on_delete=models.CASCADE, null=True
    )
    INBOUND_DEL_DETAIL_PROD_NAME = models.CharField(max_length=60, null=False)
    INBOUND_DEL_DETAIL_LINE_PRICE = models.DecimalField(
        max_digits=10, decimal_places=2, default=0
    )
    INBOUND_DEL_DETAIL_ORDERED_QTY = models.PositiveIntegerField(null=False, default=0)
    INBOUND_DEL_DETAIL_LINE_QTY_ACCEPT = models.PositiveIntegerField(
        null=True, default=0
    )
    INBOUND_DEL_DETAIL_LINE_QTY_DEFECT = models.PositiveIntegerField(
        null=True, default=0
    )
    INBOUND_DEL_DETAIL_PROD_EXP_DATE = models.DateField(null=True, blank=True)

    # def save(self, *args, **kwargs):
    #     if not self.INBOUND_DEL_DETAIL_BATCH_ID:
    #         # Ensure the related InboundDelivery instance exists
    #         inbound_delivery = (
    #             self.INBOUND_DEL_ID
    #         )  # This retrieves the related instance

    #         if not inbound_delivery:
    #             raise ValueError("Inbound Delivery instance does not exist.")

    #         if not inbound_delivery.INBOUND_DEL_DATE_DELIVERED:
    #             raise ValueError("Inbound Delivery date delivered is not set.")

    #         # Generate batch ID using the product name and delivery date
    #         prod_name_slug = slugify(self.INBOUND_DEL_DETAIL_PROD_NAME)
    #         delivery_date = inbound_delivery.INBOUND_DEL_DATE_DELIVERED.strftime(
    #             "%Y%m%d"
    #         )
    #         self.INBOUND_DEL_DETAIL_BATCH_ID = f"{prod_name_slug}-{delivery_date}"

    #     super().save(*args, **kwargs)

    class Meta:
        db_table = "INBOUND_DELIVERY_DETAILS"
        verbose_name = "Inbound Delivery Detail"
        verbose_name_plural = "Inbound Delivery Details"
