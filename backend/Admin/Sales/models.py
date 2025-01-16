from datetime import datetime, timedelta
from django.db import models
from django.db.models import Sum


from Admin.Delivery.models import OutboundDelivery
from django.conf import settings
from Admin.Customer.models import Clients
from Admin.Product.models import Product


class CustomerPayment(models.Model):
    PAYMENT_ID = models.AutoField(primary_key=True)
    OUTBOUND_DEL_ID = models.ForeignKey(
        OutboundDelivery, on_delete=models.CASCADE, related_name="customer_payments"
    )
    CLIENT_ID = models.ForeignKey(Clients, on_delete=models.CASCADE)
    CLIENT_NAME = models.CharField(max_length=255)
    PAYMENT_TERMS = models.PositiveIntegerField()
    PAYMENT_START_DATE = models.DateTimeField(auto_now_add=True)
    PAYMENT_DUE_DATE = models.DateTimeField(null=True)
    PAYMENT_METHOD = models.CharField(max_length=50)  # Cash, Check, Bank Transfer, etc.
    PAYMENT_TERMS = models.PositiveIntegerField()  # Refers in days
    PAYMENT_STATUS = models.CharField(
        max_length=20,
        choices=[
            ("Unpaid", "Unpaid"),
            ("Partially Paid", "Partially Paid"),
            ("Paid", "Paid"),
        ],
        default="Unpaid",
    )
    AMOUNT_PAID = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    AMOUNT_BALANCE = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    CREATED_AT = models.DateTimeField(auto_now_add=True)
    UPDATED_AT = models.DateTimeField(auto_now=True)
    CREATED_BY = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True
    )

    class Meta:
        db_table = "CUSTOMER_PAYMENT"
        verbose_name = "Customer Payment"
        verbose_name_plural = "Customer Payments"

    def save(self, *args, **kwargs):
        # Ensure PAYMENT_START_DATE is set before calculating PAYMENT_DUE_DATE
        if not self.PAYMENT_START_DATE:
            self.PAYMENT_START_DATE = datetime.now()
        # Calculate the due date
        if self.PAYMENT_START_DATE and self.PAYMENT_TERMS:
            self.PAYMENT_DUE_DATE = self.PAYMENT_START_DATE + timedelta(
                days=self.PAYMENT_TERMS
            )

        # Update payment status
        # if self.AMOUNT_PAID == self.AMOUNT_BALANCE and self.AMOUNT_BALANCE > 0:
        #     self.PAYMENT_STATUS = "Paid"
        # elif self.AMOUNT_PAID > 0 and self.AMOUNT_PAID < self.AMOUNT_BALANCE:
        #     self.PAYMENT_STATUS = "Partially Paid"
        # else:
        #     self.PAYMENT_STATUS = "Unpaid"

        # Call the parent class's save method
        super().save(*args, **kwargs)


# Create your models here.
class SalesInvoice(models.Model):
    SALES_INV_ID = models.CharField(
        max_length=20, unique=True, blank=True
    )  # Invoice ID
    SALES_INV_DATETIME = models.DateTimeField(
        auto_now_add=True
    )  # Invoice creation date/time
    SALES_INV_DISCOUNT = models.DecimalField(
        max_digits=10, decimal_places=2, default=0.0
    )  # Total discount for the invoice
    SALES_INV_TOTAL_PRICE = models.DecimalField(
        max_digits=10, decimal_places=2
    )  # Total invoice amount paid
    CLIENT = models.ForeignKey(
        Clients, on_delete=models.CASCADE
    )  # Reference to the client
    PAYMENT_ID = models.ForeignKey(
        CustomerPayment, on_delete=models.SET_NULL, null=True
    )  # Reference to the payment
    OUTBOUND_DEL_ID = models.ForeignKey(
        OutboundDelivery, on_delete=models.SET_NULL, null=True
    )  # Reference to the outbound delivery
    SALES_INV_CREATED_BY = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True
    )  # User who created the invoice
    SALES_INV_CREATED_AT = models.DateTimeField(
        auto_now_add=True
    )  # Timestamp when created

    # Optional: Fields for gross revenue and income
    SALES_INV_TOTAL_GROSS_REVENUE = models.DecimalField(
        max_digits=15, decimal_places=2, default=0.0
    )
    SALES_INV_TOTAL_GROSS_INCOME = models.DecimalField(
        max_digits=15, decimal_places=2, default=0.0
    )

    # def calculate_totals(self):
    #     # Calculate total gross revenue and total gross income from related SalesInvoiceItems
    #     total_revenue = (
    #         self.sales_items.aggregate(
    #             total_revenue=Sum("SALES_INV_ITEM_LINE_GROSS_REVENUE")
    #         )["total_revenue"]
    #         or 0
    #     )

    #     total_income = (
    #         self.sales_items.aggregate(
    #             total_income=Sum("SALES_INV_ITEM_LINE_GROSS_INCOME")
    #         )["total_income"]
    #         or 0
    #     )

    #     self.SALES_INV_TOTAL_GROSS_REVENUE = total_revenue
    #     self.SALES_INV_TOTAL_GROSS_INCOME = total_income

    def save(self, *args, **kwargs):
        # Automatically generate the sales invoice ID (starts with INV01)
        if not self.SALES_INV_ID:
            last_invoice = SalesInvoice.objects.all().order_by("SALES_INV_ID").last()
            if last_invoice:
                last_inv_num = int(last_invoice.SALES_INV_ID[3:]) + 1
                self.SALES_INV_ID = f"INV{last_inv_num:03d}"
            else:
                self.SALES_INV_ID = "INV001"

        # Save the SalesInvoice first to generate a primary key
        super().save(*args, **kwargs)

    class Meta:
        db_table = "SALES_INVOICE"
        verbose_name = "Sale Invoice"
        verbose_name_plural = "Sales Invoice"


class SalesInvoiceItems(models.Model):
    SALES_INV_ITEM_ID = models.AutoField(primary_key=True)
    SALES_INV_ID = models.ForeignKey(
        SalesInvoice,
        on_delete=models.CASCADE,
        related_name="sales_items",
    )
    SALES_INV_ITEM_PROD_ID = models.ForeignKey(Product, on_delete=models.CASCADE)
    SALES_INV_ITEM_PROD_NAME = models.CharField(null=True, blank=True)
    SALES_INV_item_PROD_DLVRD = models.PositiveIntegerField(default=0)
    SALES_INV_ITEM_PROD_SELL_PRICE = models.DecimalField(
        max_digits=15, decimal_places=2, default=0
    )
    SALES_INV_ITEM_PROD_PURCH_PRICE = models.DecimalField(
        max_digits=15, decimal_places=2, default=0
    )
    SALES_INV_ITEM_LINE_GROSS_REVENUE = models.DecimalField(
        max_digits=15, decimal_places=2, default=0
    )
    SALES_INV_ITEM_LINE_GROSS_INCOME = models.DecimalField(
        max_digits=15, decimal_places=2, default=0
    )

    def calculate_revenue(self):
        return self.SALES_INV_item_PROD_DLVRD * self.SALES_INV_ITEM_PROD_SELL_PRICE

    def calculate_gross_income(self):
        return self.SALES_INV_item_PROD_DLVRD * (
            self.SALES_INV_ITEM_PROD_SELL_PRICE - self.SALES_INV_ITEM_PROD_PURCH_PRICE
        )

    def save(self, *args, **kwargs):
        # Calculate Gross Revenue and Gross Income before saving
        self.SALES_INV_ITEM_LINE_GROSS_REVENUE = self.calculate_revenue()
        self.SALES_INV_ITEM_LINE_GROSS_INCOME = self.calculate_gross_income()

        # Call the parent class's save method to actually save the instance
        super().save(*args, **kwargs)

    class Meta:
        db_table = "SALES_INVOICE_ITEMS"
        verbose_name = "Sales Invoice Item"
        verbose_name_plural = "Sales Invoice Items"
