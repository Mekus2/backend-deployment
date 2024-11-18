from django.db import models

from Admin.Product.models import Product
from Admin.Delivery.models import InboundDeliveryDetails, InboundDelivery


# Create your models here.
class Inventory(models.Model):
    INVENTORY_ID = models.AutoField(primary_key=True)
    PRODUCT_ID = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="inventory_entries"
    )
    INBOUND_DEL_ID = models.ForeignKey(
        InboundDelivery,
        on_delete=models.CASCADE,
        related_name="inventory_batches",
    )
    BATCH_ID = models.CharField(max_length=50, unique=True)
    EXPIRY_DATE = models.DateField(null=True, blank=True)
    QUANTITY = models.PositiveIntegerField()  # Quantity available in stock
    LAST_UPDATED = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.PRODUCT_ID} - Batch {self.BATCH_ID} - Qty: {self.QUANTITY}"

    class Meta:
        db_table = "PRODUCT_INVENTORY"
        verbose_name = "PRODUCT INVENTORY"
        verbose_name_plural = "PRODUCTS INVENTORY"
