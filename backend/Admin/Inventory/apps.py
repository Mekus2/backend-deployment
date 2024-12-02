from django.apps import AppConfig


class InventoryConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "Admin.Inventory"

    def ready(self):
        import Admin.Inventory.signals
