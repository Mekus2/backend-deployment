from .models import SalesInvoice, SalesInvoiceItems


# Utility function to recalculate sales invoice and its items
def recalculate_sales_invoice(invoice_id):
    # Retrieve the SalesInvoice entry by ID
    invoice = SalesInvoice.objects.get(SALES_INV_ID=invoice_id)

    # Retrieve related SalesInvoiceItems using the reverse relation
    items = SalesInvoiceItems.objects.filter(SALES_INV_ID=invoice)

    # Recalculate the Gross Revenue and Gross Income for each item
    total_revenue = 0
    total_income = 0
    for item in items:
        # Recalculate revenue and income
        item.SALES_INV_ITEM_LINE_GROSS_REVENUE = item.calculate_revenue()
        item.SALES_INV_ITEM_LINE_GROSS_INCOME = item.calculate_gross_income()
        item.save()  # Save the item after recalculating

        # Add to totals
        total_revenue += item.SALES_INV_ITEM_LINE_GROSS_REVENUE
        total_income += item.SALES_INV_ITEM_LINE_GROSS_INCOME

    # Update the SalesInvoice with new totals
    invoice.SALES_INV_TOTAL_PRICE = total_revenue - invoice.SALES_INV_DISCOUNT
    invoice.save()  # Save the updated invoice

    return invoice
