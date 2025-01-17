from django.urls import path
from .views import SendOTPView, VerifyOTPView, ChangePasswordView, ResendOTPView,RegisterOTPView

urlpatterns = [
    path("otp/", SendOTPView.as_view(), name="send_otp"),
    path("verifyotp/", VerifyOTPView.as_view(), name="verify_otp"),
    path("changepassword/", ChangePasswordView.as_view(), name="change_password"),
    path("resend-otp/", ResendOTPView.as_view(), name="resend_otp"),  # New endpoint for resending OTP

    #path for creating new user otp
    path("newOtp/", RegisterOTPView.as_view(), name="Register OTP" ),
]

