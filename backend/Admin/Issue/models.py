from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

from django.utils import timezone

# Model imports
from Admin.Delivery.models import InboundDelivery, OutboundDelivery
from Admin.Customer.models import Clients
from Admin.Supplier.models import Supplier


# Create your models here.
class DeliveryIssue(models.Model):
    # Constants for choices
    ORDER_TYPE_CHOICES = [
        ("Supplier Delivery", "Supplier Delivery"),
        ("Customer Delivery", "Customer Delivery"),
        ("Uncategorized", "Uncategorized"),
    ]
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Resolved", "Resolved"),
    ]
    ISSUE_TYPE_CHOICES = [
        ("Damaged", "Damaged"),
        ("Missing", "Missing Item"),
        ("Wrong Item", "Wrong Item"),
        ("Defective", "Defective"),
        ("Expired", "Expired"),
        ("Wrong Quantity", "Wrong Quantity"),
        ("Packaging Issue", "Packaging Issue"),
        ("Other", "Other"),
    ]
    RESOLUTION_CHOICES = [
        ("Replacement", "Replacement"),
        ("Offset", "Offset"),
        ("No Selected", "Other"),
    ]

    # Fields
    ISSUE_NO = models.AutoField(primary_key=True)
    ORDER_TYPE = models.CharField(
        choices=ORDER_TYPE_CHOICES, max_length=30, default="Uncategorized"
    )
    STATUS = models.CharField(max_length=30, choices=STATUS_CHOICES, default="Pending")
    ISSUE_TYPE = models.CharField(max_length=30, choices=ISSUE_TYPE_CHOICES)
    RESOLUTION = models.CharField(
        max_length=30, choices=RESOLUTION_CHOICES, default="No Selected"
    )

    # Dynamic relationship using ContentType
    DELIVERY_TYPE = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True)
    DELIVERY_ID = models.PositiveIntegerField(null=True)
    DELIVERY = GenericForeignKey("DELIVERY_TYPE", "DELIVERY_ID")

    # Other fields
    REMARKS = models.TextField(blank=True, null=True)
    IS_RESOLVED = models.BooleanField(default=False)
    DATE_CREATED = models.DateField(auto_now_add=True)

    # Meta and string representation
    class Meta:
        verbose_name = "Delivery Issue"
        verbose_name_plural = "Delivery Issues"

    def __str__(self):
        return f"Issue #{self.ISSUE_NO} - {self.STATUS}"


class DeliveryItemIssue(models.Model):
    ISSUE_NO = models.ForeignKey(
        DeliveryIssue, on_delete=models.CASCADE, related_name="item_issues"
    )
    ISSUE_PROD_ID = models.PositiveIntegerField(null=True, blank=True)
    ISSUE_PROD_NAME = models.CharField(max_length=255, null=True, blank=True)
    ISSUE_QTY_DEFECT = models.PositiveIntegerField(null=True, blank=True)
    ISSUE_PROD_LINE_PRICE = models.DecimalField(
        max_digits=10, decimal_places=2, default=0
    )
    ISSUE_LINE_TOTAL_PRICE = models.DecimalField(
        max_digits=10, decimal_places=2, default=0
    )

    # Metadata
    class Meta:
        verbose_name = "Delivery Item Issue"
        verbose_name_plural = "Delivery Item Issues"

    # String representation
    def __str__(self):
        return f"Issue No: {self.ISSUE_NO}, Product: {self.ISSUE_PROD_NAME}"

    # Helper method to calculate the line total price
    def calculate_line_total(self):
        if self.ISSUE_QTY_DEFECT and self.ISSUE_PROD_LINE_PRICE:
            self.ISSUE_LINE_TOTAL_PRICE = (
                self.ISSUE_QTY_DEFECT * self.ISSUE_PROD_LINE_PRICE
            )
            self.save()


class ReplacementHold(models.Model):
    ACTION_CHOICES = [
        ("Return", "Return"),
        ("Replacement", "Replacement"),
    ]

    STATUS_CHOICES = [
        ("On Hold", "On Hold"),
        ("Processed", "Processed"),
    ]

    DELIVERY_TYPE_CHOICES = [
        ("Inbound Delivery", "Inbound Delivery"),
        ("Customer Delivery", "Customer Delivery"),
    ]

    delivery_issue = models.ForeignKey(
        "DeliveryIssue",
        on_delete=models.CASCADE,
        related_name="replacement_holds",
        help_text="The associated delivery issue for this hold entry.",
    )
    product_id = models.CharField(
        max_length=50,
        help_text="ID of the product associated with the hold.",
    )
    product_name = models.CharField(
        max_length=255,
        help_text="Name of the product associated with the hold.",
    )
    quantity = models.PositiveIntegerField(
        help_text="Quantity of the product involved in the hold."
    )
    price = models.DecimalField(
        max_digits=10, decimal_places=2, help_text="Price of the product per unit."
    )
    action_type = models.CharField(
        max_length=20,
        choices=ACTION_CHOICES,
        help_text="Action to be taken, either Return or Replacement.",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="On Hold",
        help_text="Current status of the hold entry.",
    )
    delivery_type = models.CharField(
        max_length=20,
        choices=DELIVERY_TYPE_CHOICES,
        help_text="Type of delivery associated with this entry (Inbound or Customer Delivery).",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the replacement hold entry was created.",
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when the replacement hold entry was last updated.",
    )

    def __str__(self):
        return f"{self.product_name} ({self.action_type} - {self.delivery_type})"
