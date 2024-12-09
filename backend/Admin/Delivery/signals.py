# delivery/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.timezone import now
from .models import Reports, InboundDelivery, OutboundDelivery, OutboundDeliveryDetails

# Signal for InboundDelivery
@receiver(post_save, sender=InboundDelivery)
def create_inbound_report(sender, instance, **kwargs):
    if instance.INBOUND_DEL_STATUS == "Received":  # Check if status is 'Received'
        # Constructing the report description
        report_description = (
            f"Inbound delivery from supplier {instance.SUPPLIER_NAME} has been marked as received."
        )

        Reports.objects.create(
            REPORT_TYPE="Purchase",
            REPORT_DATETIME=now(),
            REPORT_TITLE=f"Inbound Delivery #{instance.INBOUND_DEL_ID} Received",
            REPORT_DESCRIPTION=report_description,
            REPORT_CREATED_USER_ID=instance.INBOUND_DEL_RECEIVED_BY,
        )

# Signal for OutboundDelivery
@receiver(post_save, sender=OutboundDelivery)
def create_outbound_report(sender, instance, **kwargs):
    if instance.OUTBOUND_DEL_STATUS == "Delivered":  # Check if status is 'Delivered'
        # Get the relevant details for the outbound delivery
        outbound_details = OutboundDeliveryDetails.objects.filter(OUTBOUND_DEL_ID=instance.OUTBOUND_DEL_ID)

        # Create a list of product information to include in the report description
        product_details = []
        for detail in outbound_details:
            product_details.append(
                f"Product: {detail.OUTBOUND_DETAILS_PROD_NAME}, "
                f"Accepted: {detail.OUTBOUND_DETAILS_PROD_QTY_ACCEPTED}, "
                f"Defective: {detail.OUTBOUND_DETAILS_PROD_QTY_DEFECT}, "
                f"Line Total: {detail.OUTBOUND_DETAIL_LINE_TOTAL}"
            )

        # Joining all product details into a string
        product_details_str = "; ".join(product_details)

        Reports.objects.create(
            REPORT_TYPE="Sales",
            REPORT_DATETIME=now(),
            REPORT_TITLE=f"Outbound Delivery #{instance.OUTBOUND_DEL_ID} Delivered",
            REPORT_DESCRIPTION=(
                f"Outbound delivery to customer {instance.OUTBOUND_DEL_CUSTOMER_NAME} has been marked as delivered. "
                f"Details: {product_details_str}"
            ),
            REPORT_CREATED_USER_ID=instance.OUTBOUND_DEL_ACCPTD_BY_USER,
        )
