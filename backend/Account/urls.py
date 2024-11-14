from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, UserListView, UpdateUserView, CheckAuthenticationView, 
    UserProfileImageView, ChangePasswordView, TotalStaffCount, TotalActiveUserCount, UserListExcludeSuperAdminView,
    DeactivateUserView, ReactivateUserView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('users/', UserListView.as_view(), name='user-list'),  # For listing users
    path('users/<int:user_id>/', UserListView.as_view(), name='user-detail'),  # For fetching user by ID
    path('users/update/<int:user_id>/', UpdateUserView.as_view(), name='user-update'),  # For updating user by ID
    path('users/<int:user_id>/change-password/', ChangePasswordView.as_view(), name='change-password'),  # New URL for changing password
    path('check-auth/', CheckAuthenticationView.as_view(), name='check-auth'),
    path('users/<int:user_id>/image/', UserProfileImageView.as_view(), name='user-profile-image'),

    #returns all data except accType = superadmin
    path('lists/',UserListExcludeSuperAdminView.as_view(), name='Total Staff'),

    #Total Staff
    path('totalStaff/',TotalStaffCount.as_view(), name='Total Staff'),

    #Total Active Staff
    path('totalActiveStaff/',TotalActiveUserCount.as_view(), name='Total Active Staff'),

    #To Deactivate and reactivate user
    path('deactivateUser/<int:user_id>/',DeactivateUserView.as_view(), name='Deactivate user'),
    path('reactivateUser/<int:user_id>/',ReactivateUserView.as_view(), name='Reactivate user'),

]
    