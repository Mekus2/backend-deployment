from datetime import datetime
from django.db import models

from Admin.Product.models import Product
from Admin.Delivery.models import InboundDeliveryDetails, InboundDelivery


# Create your models here.
class Inventory(models.Model):
    INVENTORY_ID = models.CharField(primary_key=True, editable=False, unique=True)
    PRODUCT_ID = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="inventory_entries"
    )
    PRODUCT_NAME = models.CharField(max_length=120, null=True)
    INBOUND_DEL_ID = models.ForeignKey(
        InboundDelivery,
        on_delete=models.CASCADE,
        related_name="inventory_batches",
    )
    BATCH_ID = models.CharField(max_length=50, unique=True)
    EXPIRY_DATE = models.DateField(null=True, blank=True)
    QUANTITY_ON_HAND = models.PositiveIntegerField()  # Quantity available in stock
    LAST_UPDATED = models.DateTimeField(auto_now=True)
    DATE_CREATED = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.INVENTORY_ID:
            # Generate the next INVENTORY_ID
            last_inventory = Inventory.objects.order_by("-INVENTORY_ID").first()
            if last_inventory:
                last_id = int(last_inventory.INVENTORY_ID[3:])  # Extract numeric part
                new_id = f"INV{last_id + 1:05d}"  # Increment and format
            else:
                new_id = "INV00001"  # Start ID
            self.INVENTORY_ID = new_id

        if not self.BATCH_ID:
            # Generate a BATCH_ID starting with MM-YY + ID
            current_date_prefix = datetime.now().strftime("%m-%y")
            last_batch = (
                Inventory.objects.filter(BATCH_ID__startswith=current_date_prefix)
                .order_by("-BATCH_ID")
                .first()
            )

            if last_batch:
                last_batch_number = int(
                    last_batch.BATCH_ID.split("-")[-1]
                )  # Extract numeric part after MM-YY
                new_batch_id = f"{current_date_prefix}-{last_batch_number + 1:03d}"  # Increment and format
            else:
                new_batch_id = f"{current_date_prefix}-001"  # Start with MM-YY-001
            self.BATCH_ID = new_batch_id

        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"{self.PRODUCT_ID} - Batch {self.BATCH_ID} - Qty: {self.QUANTITY_ON_HAND}"
        )

    class Meta:
        db_table = "PRODUCT_INVENTORY"
        verbose_name = "PRODUCT INVENTORY"
        verbose_name_plural = "PRODUCTS INVENTORY"
