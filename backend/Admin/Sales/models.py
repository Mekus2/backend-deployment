from django.db import models

from Admin.Delivery.models import OutboundDelivery
from django.conf import settings
from Admin.Customer.models import Clients
from Admin.Product.models import Product


# Create your models here.
class SalesInvoice(models.Model):
    SALES_INV_ID = models.CharField(max_length=20, unique=True, blank=True)
    SALES_INV_DATETIME = models.DateTimeField(auto_now_add=True)
    SALES_INV_DISCOUNT = models.DecimalField(
        max_digits=10, decimal_places=2, default=0.0
    )
    SALES_INV_TOTAL_PRICE = models.DecimalField(max_digits=10, decimal_places=2)
    SALES_ORDER_DLVRY_OPTION = models.CharField(max_length=50)
    CLIENT_ID = models.ForeignKey(Clients, on_delete=models.CASCADE)
    CLIENT_NAME = models.CharField(max_length=255)
    CLIENT_PHONENUM = models.CharField(max_length=20)
    SALES_INV_PYMNT_METHOD = models.CharField(max_length=50, null=True, blank=True)
    SALES_INV_PYMNT_STATUS = models.CharField(
        max_length=20,
        choices=[
            ("Unpaid", "Unpaid"),
            ("Partially Paid", "Partially Paid"),
            ("Paid", "Paid"),
        ],
        default="Unpaid",
    )
    SALES_INV_PYMNT_DATE = models.DateField(null=True, blank=True)
    SALES_INV_AMOUNT_PAID = models.DecimalField(
        max_digits=10, decimal_places=2, default=0.0
    )
    SALES_INV_AMOUNT_BALANCE = models.DecimalField(
        max_digits=10, decimal_places=2, default=0.0
    )
    SALES_INV_CREATED_AT = models.DateTimeField(auto_now_add=True)
    SALES_INV_UPDATED_AT = models.DateTimeField(auto_now=True)
    SALES_INV_CREATED_USER_ID = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True
    )
    OUTBOUND_DEL_ID = models.ForeignKey(OutboundDelivery, on_delete=models.CASCADE)

    def save(self, *args, **kwargs):
        # Automatically calculate balance
        self.SALES_INV_AMOUNT_BALANCE = (
            self.SALES_INV_TOTAL_PRICE - self.SALES_INV_AMOUNT_PAID
        )

        # Set the payment status based on the balance and amount paid
        if self.SALES_INV_AMOUNT_BALANCE == 0:
            self.SALES_INV_PYMNT_STATUS = "Paid"
        elif self.SALES_INV_AMOUNT_PAID == 0:
            self.SALES_INV_PYMNT_STATUS = "Unpaid"
        else:
            self.SALES_INV_PYMNT_STATUS = "Partially Paid"

        # Automatically generate the sales invoice ID (starts with INV01)
        if not self.SALES_INV_ID:
            last_invoice = SalesInvoice.objects.all().order_by("SALES_INV_ID").last()
            if last_invoice:
                # Increment the last invoice ID (e.g., INV001 -> INV002)
                last_inv_num = int(last_invoice.SALES_INV_ID[3:]) + 1
                self.SALES_INV_ID = f"INV{last_inv_num:03d}"
            else:
                # If it's the first invoice, start with INV01
                self.SALES_INV_ID = "INV001"

        super().save(*args, **kwargs)

    class Meta:
        db_table = "SALES_INVOICE"
        verbose_name = "Sale Invoice"
        verbose_name_plural = "Sales Invoice"


class SalesInvoiceItems(models.Model):
    SALES_INV_ITEM_ID = models.AutoField(primary_key=True)
    SALES_INV_ID = models.ForeignKey(SalesInvoice, on_delete=models.CASCADE)
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
