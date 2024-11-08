from django.core.mail import send_mail


def send_test_email():
    send_mail(
        "Test Email from Django",
        "This is a test email to verify the email configuration.",
        "philvets246@gmail.com",  # Replace with your email
        ["ediebasay21@gmail.com"],  # Replace with the recipient's email
        fail_silently=False,
    )


if __name__ == "__main__":
    send_test_email()
