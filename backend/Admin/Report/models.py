from django.db import models
from Admin.Delivery.models import InboundDelivery, OutboundDelivery
from Account.models import User  # Ensure correct import for the User model

class Reports(models.Model):
    REPORT_ID = models.AutoField(primary_key=True)
    REPORT_TYPE = models.CharField(max_length=60, null=False)
    REPORT_DATETIME = models.DateTimeField(null=True, blank=True)
    REPORT_TITLE = models.CharField(max_length=60, null=False)
    REPORT_DESCRIPTION = models.TextField()  # Changed to TextField (no max length)
    REPORT_CREATED_USER_ID = models.ForeignKey(User, on_delete=models.SET_NULL, null=True,
                                                blank=True
                                               )
    
    
    def __str__(self):
        return f"Report #{self.REPORT_ID} - {self.REPORT_TITLE}"
