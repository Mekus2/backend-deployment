from django.db import transaction
from django.utils.timezone import now
from .models import InboundDelivery, InboundDeliveryDetails
import logging

# Configure logger
logger = logging.getLogger(__name__)


def update_inbound_delivery_totals(inbound_delivery_id):
    try:
        logger.info(
            f"Starting update for InboundDelivery with ID: {inbound_delivery_id}"
        )

        with transaction.atomic():
            # Fetch the InboundDelivery object
            try:
                inbound_delivery = InboundDelivery.objects.get(pk=inbound_delivery_id)
            except InboundDelivery.DoesNotExist:
                logger.error(
                    f"InboundDelivery with ID {inbound_delivery_id} does not exist."
                )
                raise ValueError(
                    f"InboundDelivery with ID {inbound_delivery_id} does not exist."
                )

            logger.info(f"Fetched InboundDelivery with ID {inbound_delivery_id}")

            # Fetch related details
            details = InboundDeliveryDetails.objects.filter(
                INBOUND_DEL_ID=inbound_delivery_id
            )
            logger.info(
                f"Fetched {details.count()} related details for InboundDelivery ID {inbound_delivery_id}"
            )

            total_price = 0
            total_received_qty = 0

            for detail in details:
                # Calculate line defect quantity
                line_qty_defect = (
                    detail.INBOUND_DEL_DETAIL_ORDERED_QTY
                    - detail.INBOUND_DEL_DETAIL_LINE_QTY_ACCEPT
                )
                detail.INBOUND_DEL_DETAIL_LINE_QTY_DEFECT = line_qty_defect

                # Log defect quantity calculation
                logger.debug(
                    f"Detail ID {detail.INBOUND_DEL_DETAIL_ID}: Ordered qty - {detail.INBOUND_DEL_DETAIL_ORDERED_QTY}, "
                    f"Accepted qty - {detail.INBOUND_DEL_DETAIL_LINE_QTY_ACCEPT}, "
                    f"Defect qty - {line_qty_defect}"
                )

                # Calculate line price
                line_price = detail.INBOUND_DEL_DETAIL_LINE_PRICE
                detail.INBOUND_DEL_DETAIL_LINE_PRICE = line_price

                # Log price calculation
                logger.debug(
                    f"Detail ID {detail.INBOUND_DEL_DETAIL_ID}: Line price - {line_price}"
                )

                # Update total price and total received quantity
                total_price += line_price
                total_received_qty += detail.INBOUND_DEL_DETAIL_LINE_QTY_ACCEPT

                # Log total price and received quantity
                logger.debug(
                    f"Detail ID {detail.INBOUND_DEL_DETAIL_ID}: Total price so far - {total_price}, "
                    f"Total received qty so far - {total_received_qty}"
                )

                # Save the updated detail
                detail.save()

            # Check for valid deduction before updating the total ordered quantity
            if inbound_delivery.INBOUND_DEL_TOTAL_ORDERED_QTY < total_received_qty:
                logger.error(
                    f"Total received quantity ({total_received_qty}) exceeds ordered quantity "
                    f"({inbound_delivery.INBOUND_DEL_TOTAL_ORDERED_QTY}) for InboundDelivery ID {inbound_delivery_id}."
                )
                raise ValueError(
                    "Total received quantity exceeds total ordered quantity."
                )

            # Update the InboundDelivery fields
            inbound_delivery.INBOUND_DEL_TOTAL_PRICE = total_price
            inbound_delivery.INBOUND_DEL_TOTAL_RCVD_QTY = total_received_qty

            # Log totals before saving
            logger.info(
                f"Updating InboundDelivery: Total price - {total_price}, "
                f"Total received qty - {total_received_qty}, "
                f"Total ordered qty after deduction - {inbound_delivery.INBOUND_DEL_TOTAL_ORDERED_QTY}"
            )

            # Save the updated InboundDelivery
            inbound_delivery.save()

            logger.info(
                f"Successfully updated InboundDelivery with ID {inbound_delivery_id}"
            )

            return {
                "message": "InboundDelivery and details updated successfully.",
                "INBOUND_DEL_TOTAL_PRICE": total_price,
                "INBOUND_DEL_TOTAL_RCVD_QTY": total_received_qty,
                "INBOUND_DEL_TOTAL_ORDERED_QTY": inbound_delivery.INBOUND_DEL_TOTAL_ORDERED_QTY,
            }

    except Exception as e:
        logger.error(
            f"An error occurred while updating InboundDelivery with ID {inbound_delivery_id}: {str(e)}"
        )
        raise e  # Re-raise the exception to ensure transaction rollback
