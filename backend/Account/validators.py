# Account/validators.py
from django.core.exceptions import ValidationError


def custom_password_validator(value):
    if len(value) < 8:
        raise ValidationError("Password must be at least 8 characters long.")
    # Add more custom validation logic if needed
