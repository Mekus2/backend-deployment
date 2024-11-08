from django.urls import path
from .views import SendOTPView, VerifyOTPView, ChangePasswordView

urlpatterns = [
    path("otp/", SendOTPView.as_view(), name="send_otp"),
    path("verifyotp/", VerifyOTPView.as_view(), name="verify_otp"),
    path("changepassword/", ChangePasswordView.as_view(), name="change_password"),
]
