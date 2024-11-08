from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta


class OTP(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="otps"
    )
    otp_value = models.CharField(max_length=6)  # Assuming a 6-digit OTP
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)  # To mark OTP as used

    def save(self, *args, **kwargs):
        # Set expiration time to 15 minutes from creation (you can adjust as needed)
        self.expires_at = timezone.now() + timedelta(minutes=15)
        super().save(*args, **kwargs)

    def is_valid(self):
        """Check if the OTP is still valid and has not been used."""
        return timezone.now() < self.expires_at and not self.is_used

    def __str__(self):
        return f"OTP for {self.user.username} - Value: {self.otp_value}"
