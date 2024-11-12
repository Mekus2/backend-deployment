# Login/views.py
from django.core.mail import send_mail
from django.contrib.auth import authenticate
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from .serializers import *

class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        token_serializer = MyTokenObtainPairSerializer.get_token(user)

        # Prepare the response data
        response_data = {
            'id': user.id,
            'type': user.accType,
            'username': user.username,
            'first_name': user.first_name,  # Corrected spelling here
            'message': 'Login Successful',
            'access': str(token_serializer.access_token),
            'refresh': str(token_serializer),
        }

        # Create the response and set the access token as an HTTP-only cookie
        response = Response(response_data, status=status.HTTP_200_OK)
        response.set_cookie(
            key='access_token',
            value=str(token_serializer.access_token),
            httponly=True,  # Makes the cookie inaccessible via JavaScript
            secure=True,    # Ensures cookie is only sent over HTTPS
            samesite='Lax'  # Restricts cookie sending to prevent CSRF attacks
        )

        return response

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]  # Only authenticated users can access this view

    def post(self, request, *args, **kwargs):
        try:
            # Retrieve the refresh token from the request data
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response({'message': 'Refresh token required'}, status=status.HTTP_400_BAD_REQUEST)

            # Blacklist the token to invalidate it
            token = RefreshToken(refresh_token)
            try:
                token.blacklist()
            except TokenError:
                return Response({'message': 'Token is already blacklisted or invalid'}, status=status.HTTP_400_BAD_REQUEST)

            # Clear the access token cookie
            response = Response({'message': 'Logout successful'}, status=status.HTTP_205_RESET_CONTENT)
            response.delete_cookie('access_token')
            return response

        except Exception as e:
            return Response({'message': 'An error occurred while logging out'}, status=status.HTTP_400_BAD_REQUEST)
