from rest_framework import serializers
from .models import Logs
from django.utils.timezone import localtime
from pytz import timezone

class LogsSerializer(serializers.ModelSerializer):
    LOG_DATETIME = serializers.SerializerMethodField()  # Custom formatting for datetime

    class Meta:
        model = Logs
        fields = ['id', 'LLOG_TYPE', 'LOG_DESCRIPTION', 'LOG_DATETIME', 'USER_ID']
        read_only_fields = ['id', 'LOG_DATETIME']

    def get_LOG_DATETIME(self, obj):
        # Explicitly convert to Manila timezone
        manila_timezone = timezone('Asia/Manila')
        manila_time = obj.LOG_DATETIME.astimezone(manila_timezone)
        return manila_time.strftime("%B %d, %Y %H:%M")  # Formats to "November 21, 2024 12:20"
