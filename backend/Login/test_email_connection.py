from django.core.mail import send_mail
from django.conf import settings
import django
import os

# Initialize Django if it's not already
os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE", "PHILVETS.settings"
)  # Replace 'your_project_name' with your Django project name
django.setup()


def send_test_email():
    try:
        send_mail(
            "Test Email Subject",
            "This is a test email body.",
            settings.DEFAULT_FROM_EMAIL,
            [
                "ediebasay21@gmail.com"
            ],  # Replace with your own email address for testing
            fail_silently=False,
        )
        print("Test email sent successfully.")  # Confirmation message for email sent
    except Exception as e:
        print(f"An error occurred: {e}")


if __name__ == "__main__":
    print("Attempting to send test email...")
    send_test_email()
