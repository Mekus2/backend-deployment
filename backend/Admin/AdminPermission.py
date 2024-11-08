from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_authenticated:
            print(
                f"User: {request.user.username}, accType: {request.user.accType}"
            )  # Debug output
            return request.user.accType == "admin" or request.user.accType == "Admin"
        return False
