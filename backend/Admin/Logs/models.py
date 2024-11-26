from django.db import models
from django.utils import timezone
from Account.models import User

class Logs(models.Model):
    LLOG_TYPE = models.CharField(max_length=255, blank=False, null=False)
    LOG_DESCRIPTION = models.TextField(blank=False, null=False)
    LOG_DATETIME = models.DateTimeField(default=timezone.now)
    USER_ID = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="logs"
    )

    def __str__(self):
        formatted_datetime = self.LOG_DATETIME.strftime('%B %d, %Y %H:%M')  # Example: "September 20, 2024 08:56"
        return f"{self.LLOG_TYPE} - {self.USER_ID.username} at {formatted_datetime}"
