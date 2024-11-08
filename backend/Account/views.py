from rest_framework import permissions, status
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from .serializers import RegisterSerializer, UserSerializer
import os
from .models import User
from django.shortcuts import get_object_or_404
from django.http import HttpResponse, JsonResponse
from Admin.AdminPermission import IsAdminUser
from Admin.authentication import CookieJWTAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication


class RegisterView(APIView):
    #   permission_classes = [IsAdminUser]
    permission_classes = [AllowAny]
    authentication_classes = [CookieJWTAuthentication]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserListView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [
        AllowAny
    ]  # Override here to bypass authentication for testing

    def get(self, request, user_id=None):
        if user_id is not None:
            # Fetch a specific user by user_id (PK)
            try:
                user = User.objects.get(id=user_id, isActive=True)
                serializer = UserSerializer(user)
                return Response(serializer.data)
            except User.DoesNotExist:
                return Response(
                    {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
                )

        # If user_id is not provided, return a list of active users
        users = User.objects.filter(isActive=True)
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class UpdateUserView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [AllowAny]

    def get_object(self, user_id):
        try:
            return User.objects.get(id=user_id, isActive=True)
        except User.DoesNotExist:
            return None

    def get(self, request, user_id):
        user = self.get_object(user_id)
        if not user:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        user_data = {
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phonenumber": user.phonenumber,
            "address": user.address,
        }

        if request.user.accType == "admin":
            user_data.update(
                {
                    "accType": user.accType,
                    "isActive": user.isActive,
                }
            )

        return Response(user_data)

    def put(self, request, user_id):
        user = self.get_object(user_id)
        if not user:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            updated_user = serializer.save()  # noqa:F841
            updated_data = serializer.data

            return Response(updated_data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, user_id):
        user = self.get_object(user_id)
        if not user:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        user.isActive = False
        user.dateUpdated = timezone.now()
        user.save()
        return Response(
            {"message": "User has been soft deleted"}, status=status.HTTP_204_NO_CONTENT
        )


class CheckAuthenticationView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.is_authenticated:
            # Construct the image URL
            if user.image:
                image_url = request.build_absolute_uri(
                    user.image.url
                )  # Build the absolute URL
            else:
                image_url = None  # No image available

            return Response(
                {
                    "message": "User is authenticated",
                    "user_id": user.id,
                    "username": user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "phonenumber": user.phonenumber,
                    "address": user.address,
                    "accType": user.accType,
                    "image": image_url,  # Include the constructed image URL
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED
        )


class UserProfileImageView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        # Fetch the user object or return 404 if not found
        user = get_object_or_404(User, id=user_id, isActive=True)

        if user.image:  # Check if the user has an image
            # Build the absolute URL for the image
            image_url = request.build_absolute_uri(user.image.url)
            return Response({"image_url": image_url}, status=status.HTTP_200_OK)
        else:
            return Response(
                {"error": "User has no profile image"}, status=status.HTTP_404_NOT_FOUND
            )
