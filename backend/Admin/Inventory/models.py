from django.db import models

from Admin.Product.models import Product
from Admin.Delivery.models import InboundDeliveryDetails, InboundDelivery


# Create your models here.
class Inventory(models.Model):
    INVENTORY_ID = models.CharField(primary_key=True, editable=False, unique=True)
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

    def save(self, *args, **kwargs):
        if not self.INVENTORY_ID:
            # Generate the next INVENTORY_ID
            last_entry = Inventory.objects.order_by("-INVENTORY_ID").first()
            if last_entry:
                last_id = int(last_entry.INVENTORY_ID[3:])  # Extract numeric part
                new_id = f"INV{last_id + 1:05d}"  # Increment and format
            else:
                new_id = "INV00001"  # Start ID
            self.INVENTORY_ID = new_id
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.PRODUCT_ID} - Batch {self.BATCH_ID} - Qty: {self.QUANTITY}"

    class Meta:
        db_table = "PRODUCT_INVENTORY"
        verbose_name = "PRODUCT INVENTORY"
        verbose_name_plural = "PRODUCTS INVENTORY"
