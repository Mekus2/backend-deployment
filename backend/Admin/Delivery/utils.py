from django.db import transaction
from django.utils.timezone import now
from .models import InboundDelivery, InboundDeliveryDetails


def update_inbound_delivery_totals(inbound_delivery_id):
    try:
        with transaction.atomic():
            # Fetch the InboundDelivery object
            inbound_delivery = InboundDelivery.objects.get(pk=inbound_delivery_id)

            # Fetch related details
            details = InboundDeliveryDetails.objects.filter(
                INBOUND_DEL_ID=inbound_delivery_id
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

                # Calculate line price
                line_price = (
                    detail.INBOUND_DEL_DETAIL_LINE_QTY_ACCEPT
                    * detail.INBOUND_DEL_DETAIL_LINE_PRICE
                )
                detail.INBOUND_DEL_DETAIL_LINE_PRICE = line_price

                # Update total price and total received quantity
                total_price += line_price
                total_received_qty += detail.INBOUND_DEL_DETAIL_LINE_QTY_ACCEPT

                # Save the updated detail
                detail.save()

            # Update the InboundDelivery fields
            inbound_delivery.INBOUND_DEL_TOTAL_PRICE = total_price
            inbound_delivery.INBOUND_DEL_TOTAL_RCVD_QTY = total_received_qty

            # Deduct total received quantity from total ordered quantity
            inbound_delivery.INBOUND_DEL_TOTAL_ORDERED_QTY -= total_received_qty

            # Save the updated InboundDelivery
            inbound_delivery.save()

            return {
                "message": "InboundDelivery and details updated successfully.",
                "INBOUND_DEL_TOTAL_PRICE": total_price,
                "INBOUND_DEL_TOTAL_RCVD_QTY": total_received_qty,
                "INBOUND_DEL_TOTAL_ORDERED_QTY": inbound_delivery.INBOUND_DEL_TOTAL_ORDERED_QTY,
            }

    except InboundDelivery.DoesNotExist:
        return {
            "error": f"InboundDelivery with ID {inbound_delivery_id} does not exist."
        }

    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}
