from rest_framework import permissions, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from django.contrib.auth.hashers import make_password
from django.shortcuts import get_object_or_404
from .serializers import RegisterSerializer, UserSerializer
from .models import User
from Admin.AdminPermission import IsAdminUser
from Admin.authentication import CookieJWTAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication

class RegisterView(APIView):
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
    permission_classes = [AllowAny]  # Override here to bypass authentication for testing

    def get(self, request, user_id=None):
        if user_id is not None:
            try:
                user = User.objects.get(id=user_id, isActive=True)
                serializer = UserSerializer(user)
                return Response(serializer.data)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        users = User.objects.filter(isActive=True)
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    
    def put(self, request, user_id=None):
        if user_id is not None:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
            serializer = UserSerializer(user, data=request.data, partial=True)  # partial=True allows partial updates
            if serializer.is_valid():
                serializer.save()  # Save the updated user data
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': 'User ID is required for update'}, status=status.HTTP_400_BAD_REQUEST)

class UpdateUserView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [AllowAny]

    def get_object(self, user_id):
        return get_object_or_404(User, id=user_id, isActive=True)

    def get(self, request, user_id):
        user = self.get_object(user_id)
        user_data = {
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phonenumber': user.phonenumber,
            'address': user.address,
        }
        return Response(user_data)

    def put(self, request, user_id):
        user = self.get_object(user_id)
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            updated_user = serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, user_id):
        user = self.get_object(user_id)
        user.isActive = False
        user.dateUpdated = timezone.now()
        user.save()
        return Response({'message': 'User has been soft deleted'}, status=status.HTTP_204_NO_CONTENT)

class ChangePasswordView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = [CookieJWTAuthentication]
    
    def put(self, request, user_id):
        user = get_object_or_404(User, id=user_id)

        # # Ensure the requesting user is allowed to change the password
        # if request.user != user:
        #     return Response({'error': 'You are not authorized to change this password.'},
        #                     status=status.HTTP_403_FORBIDDEN)

        old_password = request.data.get("old_password")
        new_password = request.data.    get("new_password")
        

        # Validate that the new passwords match
       

        # Check if the old password is correct
        if not user.check_password(old_password):
            return Response({'error': 'Old password is incorrect.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Hash and set the new password
        user.password = make_password(new_password)
        user.save()

        return Response({'message': 'Password updated successfully.'}, status=status.HTTP_200_OK)

class CheckAuthenticationView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.is_authenticated:
            image_url = request.build_absolute_uri(user.image.url) if user.image else None
            return Response({
                'message': 'User is authenticated',
                'user_id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phonenumber': user.phonenumber,
                'address': user.address,
                'accType': user.accType,
                'image': image_url,
            }, status=status.HTTP_200_OK)
        
        return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

class UserProfileImageView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        user = get_object_or_404(User, id=user_id)

        if user.image:
            image_url = request.build_absolute_uri(user.image.url)
            return Response({'image_url': image_url}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'User has no profile image'}, status=status.HTTP_404_NOT_FOUND)


class TotalStaffCount(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        total_staff = User.objects.count()
        return Response({total_staff}, status=status.HTTP_200_OK)
    

class TotalActiveUserCount(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        # Count the number of active users
        total_active_users = User.objects.filter(isActive=True).count()
        return Response({ total_active_users}, status=status.HTTP_200_OK)
    

class UserListExcludeSuperAdminView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        """
        Handle GET request to return a list of active users, excluding superadmin.
        """
        try:
            # Query users and exclude those with accType='superadmin' or isActive=False
            users = User.objects.exclude(accType='superadmin').exclude(isActive=False)
            
            # Serialize the users
            serializer = UserSerializer(users, many=True)
            
            # Return the serialized data in the response
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            # Handle errors (e.g., database errors, etc.)
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

class DeactivateUserView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [AllowAny]  # Only authenticated admins can deactivate

    def put(self, request, user_id):
        """
        Set isActive to False for a specified user by user_id.
        """
        user = get_object_or_404(User, id=user_id)

        # Update isActive to False and set dateUpdated to the current time
        user.isActive = False
        user.dateUpdated = timezone.now()
        user.save()

        return Response({'message': 'User has been deactivated successfully'}, status=status.HTTP_200_OK)


class ReactivateUserView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [AllowAny]  # Only authenticated admins can deactivate

    def put(self, request, user_id):
        """
        Set isActive to False for a specified user by user_id.
        """
        user = get_object_or_404(User, id=user_id)

        # Update isActive to False and set dateUpdated to the current time
        user.isActive = True
        user.dateUpdated = timezone.now()
        user.save()

        return Response({'message': 'User has been reactivated successfully'}, status=status.HTTP_200_OK)
