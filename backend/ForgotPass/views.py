from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
import random
import re
from django.conf import settings
from .models import OTP  # Ensure to import your OTP model
from django.utils import timezone

User = get_user_model()


class SendOTPView(APIView):
    permission_classes = [permissions.AllowAny]  # Allow public access to this endpoint

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")

        if not email:
            return Response(
                {"message": "Email is required."}, status=status.HTTP_400_BAD_REQUEST
            )

        # Check if email exists
        if not User.objects.filter(email=email).exists():
            return Response(
                {"message": "Email not found."}, status=status.HTTP_404_NOT_FOUND
            )

        # Retrieve the user
        user = User.objects.get(email=email)

        # Generate a 6-digit OTP
        otp_value = str(random.randint(100000, 999999))

        # Create and save the OTP instance
        otp_instance = OTP.objects.create(user=user, otp_value=otp_value)  # noqa:F841

        # Custom email message
        email_message = f"""
        Hi {user.first_name},
        You recently requested to reset your password. To do so, here is your OTP to complete the reset:
        {otp_value}
        If you did not request this, please ignore this email.
        """

        # Send the OTP via email
        try:
            send_mail(
                "Your OTP for Password Reset",
                email_message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            return Response(
                {"message": "OTP sent to email successfully."},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"message": f"Failed to send OTP. Error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")

        if not email or not otp:
            return Response(
                {"message": "Email and OTP are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"message": "User with this email does not exist."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Get the latest OTP associated with the user
        otp_instance = OTP.objects.filter(user=user).order_by("-created_at").first()
        if not otp_instance:
            return Response(
                {"message": "No OTP found. Please request a new one."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check if the OTP matches and is still valid
        if otp_instance.otp_value != otp:
            return Response(
                {"message": "Invalid OTP. Please try again."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not otp_instance.is_valid():
            return Response(
                {"message": "OTP has expired. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # OTP is valid
        return Response(
            {"message": "OTP verified. You can now change your password."},
            status=status.HTTP_200_OK,
        )


class ChangePasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        new_password = request.data.get("new_password")
        otp = request.data.get("otp")  # Add this line to get OTP

        if not email or not new_password or not otp:
            return Response(
                {"message": "Email, new password, and OTP are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate the new password and OTP (updated validation)
        if (
            len(new_password) < 8
            or not re.search(r"[a-z]", new_password)  # Lowercase letter
            or not re.search(r"[A-Z]", new_password)  # Uppercase letter
            or not re.search(r"\d", new_password)  # Number
            or not re.search(
                r"[!@#$%^&*(),.?\":{}|<>]", new_password
            )  # Special character
        ):
            return Response(
                {
                    "message": "Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email)

            # Check if the OTP is valid before allowing password change
            otp_instance = OTP.objects.filter(user=user).order_by("-created_at").first()
            if (
                not otp_instance
                or otp_instance.otp_value != otp
                or not otp_instance.is_valid()
            ):
                return Response(
                    {"message": "Invalid or expired OTP. Please request a new one."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Set the new password
            user.set_password(new_password)
            user.save()
            return Response(
                {"message": "Password changed successfully."}, status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {"message": "User not found."}, status=status.HTTP_404_NOT_FOUND
            )


class ResendOTPView(APIView):
    permission_classes = [permissions.AllowAny]  # Allow public access to this endpoint

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")

        if not email:
            return Response(
                {"message": "Email is required."}, status=status.HTTP_400_BAD_REQUEST
            )

        # Check if email exists
        if not User.objects.filter(email=email).exists():
            return Response(
                {"message": "Email not found."}, status=status.HTTP_404_NOT_FOUND
            )

        # Retrieve the user
        user = User.objects.get(email=email)

        # Mark the current OTP as used (if it exists)
        otp_instance = (
            OTP.objects.filter(user=user, is_used=False).order_by("-created_at").first()
        )
        if otp_instance:
            otp_instance.is_used = True
            otp_instance.save()

        # Generate a new 6-digit OTP
        otp_value = str(random.randint(100000, 999999))

        # Create and save the new OTP instance
        new_otp_instance = OTP.objects.create(  # noqa:F841
            user=user, otp_value=otp_value
        )

        # Custom email message
        email_message = f"""
        Hi {user.first_name},
        You recently requested to reset your password. To do so, here is your new OTP to complete the reset:
        {otp_value}
        If you did not request this, please ignore this email.
        """

        # Send the OTP via email
        try:
            send_mail(
                "Your OTP for Password Reset",
                email_message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            return Response(
                {"message": "New OTP sent to email successfully."},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"message": f"Failed to send OTP. Error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class RegisterOTPView(APIView):
    permission_classes = [permissions.AllowAny]  # Allow public access to this endpoint

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")

        if not email:
            return Response(
                {"message": "Email is required."}, status=status.HTTP_400_BAD_REQUEST
            )

        # Check if email exists
        if not User.objects.filter(email=email).exists():
            return Response(
                {"message": "Email not found."}, status=status.HTTP_404_NOT_FOUND
            )

        # Retrieve the user
        user = User.objects.get(email=email)

        # Generate a 6-digit OTP
        otp_value = str(random.randint(100000, 999999))

        # Create and save the OTP instance
        otp_instance = OTP.objects.create(user=user, otp_value=otp_value)  # noqa:F841

        # Custom email message
        email_message = f"""
        Hi {user.first_name},
        This is the otp for creating new user:
        {otp_value}
        If you did not request this, please ignore this email.
        """

        # Send the OTP via email
        try:
            send_mail(
                "Your OTP for Password Reset",
                email_message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            return Response(
                {"message": "OTP sent to email successfully."},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"message": f"Failed to send OTP. Error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )