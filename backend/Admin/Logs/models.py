from django.db import models
from django.utils import timezone
from Account.models import User 
from django.utils import timezone

# Create your models here.
class Logs(models.Model):
    LLOG_TYPE = models.CharField(max_length=255, blank=False, null=False)
    LOG_DESCRIPTION = models.CharField(max_length=255, blank = False, null = False)
    LOG_DATETIME = models.DateTimeField(default=timezone.now)
    USER_ID = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name="logs"
    ) 

    def __str__(self):
        return f"{self.LOG_TYPE} - {self.USER_ID.username} at {self.LOG_DATETIME}"