from django.apps import AppConfig

class DeliveryConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "Admin.Delivery"  # Keep the app name correct

    def ready(self):
        # Ensure signals are imported
        import Admin.Delivery.signals  # This imports the signals module to connect the signal handlers
