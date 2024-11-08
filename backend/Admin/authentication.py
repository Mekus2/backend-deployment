# Account/authentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication


class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # Get the JWT access token from the cookie
        access_token = request.COOKIES.get("access_token")
        if access_token is None:
            return None

        try:
            # Validate the access token
            validated_token = self.get_validated_token(access_token)
        except Exception:
            return None

        # Return the user and validated token
        return self.get_user(validated_token), validated_token
