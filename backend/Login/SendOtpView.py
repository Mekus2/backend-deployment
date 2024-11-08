# Login/otp_views.py
import random
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

User = get_user_model()


class SendOTPView(APIView):
    permission_classes = [AllowAny]  # Allow public access to this endpoint

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")

        if not email:
            return Response(
                {"message": "Email is required."}, status=status.HTTP_400_BAD_REQUEST
            )

        # Check if email exists in the database
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"message": "Email not found."}, status=status.HTTP_404_NOT_FOUND
            )

        # Generate a 6-digit OTP
        otp = random.randint(100000, 999999)

        # Save or associate the OTP with the user (assuming User model has an 'otp' field)
        user.otp = otp
        user.save()

        # Send the OTP via email
        try:
            send_mail(
                "Your OTP for Password Reset",
                f"Your OTP is: {otp}",
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
