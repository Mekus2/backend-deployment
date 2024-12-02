from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Sum
from .models import Inventory
import logging

# Set up logging
logger = logging.getLogger(__name__)


@receiver([post_save, post_delete], sender=Inventory)
def update_product_qoh(sender, instance, **kwargs):
    try:
        # Get the product associated with the inventory instance
        affected_product = instance.PRODUCT_ID

        if not affected_product:
            logger.warning("Inventory instance has no associated product.")
            return

        # Calculate the total quantity on hand (QOH) for this product across all inventory batches
        total_qoh = (
            Inventory.objects.filter(PRODUCT_ID=affected_product).aggregate(
                total_quantity=Sum("QUANTITY_ON_HAND")
            )["total_quantity"]
            or 0  # Default to 0 if no inventory batches exist
        )

        # Log the updated total QOH for debugging
        logger.info(
            f"Updating QOH for Product ID {affected_product.pk} ({affected_product.PROD_NAME}). "
            f"New QOH: {total_qoh}."
        )

        # Update the product's QOH only if it has changed
        if affected_product.PROD_QOH != total_qoh:
            affected_product.PROD_QOH = total_qoh
            affected_product.save()
            logger.info(
                f"Product QOH updated successfully for Product ID {affected_product.pk}."
            )
        else:
            logger.info(f"QOH for Product ID {affected_product.pk} remains unchanged.")

    except Exception as e:
        # Log any errors for debugging
        logger.error(f"Error updating QOH for Product: {str(e)}", exc_info=True)
