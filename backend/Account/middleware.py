# Account/middleware.py
from django.http import HttpResponseForbidden


class LoginRequiredMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip authentication check for the login endpoint
        if request.path.startswith("/api/login"):
            response = self.get_response(request)
            return response

        # Check for authentication for other endpoints
        if request.path.startswith("/api/") and hasattr(request, "user"):
            if not request.user.is_authenticated:
                return HttpResponseForbidden(
                    "You must be logged in to access this resource."
                )

        response = self.get_response(request)
        return response
