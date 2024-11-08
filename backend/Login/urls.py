from django.urls import path
from .views import LoginView, LogoutView

# from .SendOtpView import SendOTPView

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
]
