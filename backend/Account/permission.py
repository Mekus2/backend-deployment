from rest_framework.permissions import BasePermission


class IsAdminOrSelf(BasePermission):
    """
    Custom permission to only allow admins to edit any user and staff to edit only their own data.
    """

    def has_object_permission(self, request, view, obj):
        # Admins can edit any user
        if request.user.is_staff:
            return True

        # Staff can only edit their own data
        return obj == request.user
