from rest_framework import serializers
from .models import Logs

class LogsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Logs
        fields = ['id', 'LLOG_TYPE', 'LOG_DESCRIPTION', 'LOG_DATETIME', 'USER_ID']
        read_only_fields = ['id', 'LOG_DATETIME']
