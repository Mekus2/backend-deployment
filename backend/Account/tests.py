from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import AccessToken
from Account.models import User


class RegisterViewTest(APITestCase):
    def test_user_registration(self):
        url = reverse(
            "register"
        )  # Assuming the URL name for RegisterView is 'register'
        data = {
            "username": "testuser",
            "password": "password123",
            "email": "testuser@example.com",
            "first_name": "Test",
            "last_name": "User",
            "phonenumber": "1234567890",
            "address": "123 Test Street",
            "accType": "customer",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(
            response.status_code, status.HTTP_201_CREATED
        )  # Check if the user was created successfully
        self.assertEqual(response.data["username"], data["username"])
        self.assertEqual(response.data["email"], data["email"])
        print("Register Test Success!")


class UserListViewTest(APITestCase):
    def setUp(self):
        # Create a test user with all required fields
        self.user = User.objects.create_user(
            username="testuser",
            password="testpassword",
            email="testuser@example.com",
            first_name="Test",
            last_name="User",
            phonenumber="1234567890",
            address="123 Test Street",
            accType="customer",
            isActive=True,  # Ensure user is active
        )
        self.url = reverse("user-list")  # Assuming URL name is 'user-list'
        self.token = str(
            AccessToken.for_user(self.user)
        )  # Generate a token for the user

    def test_get_active_user_list(self):
        # Set the authorization header for the request
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + self.token)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print("User List Test Success!")


class SoftDeleteUserTest(APITestCase):
    def setUp(self):
        # Create a test user with all required fields
        self.user = User.objects.create_user(
            username="deleteuser",
            password="password123",
            email="deleteuser@example.com",
            first_name="Delete",
            last_name="User",
            phonenumber="1234567890",
            address="123 Test Street",
            accType="customer",
            isActive=True,  # Ensure user is active
        )
        self.url = reverse(
            "user-update", kwargs={"pk": self.user.id}
        )  # Assuming URL name is 'user-update' and uses PK
        self.token = str(
            AccessToken.for_user(self.user)
        )  # Generate a token for the user

    def test_soft_delete_user(self):
        # Set the authorization header for the request
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + self.token)
        response = self.client.delete(self.url)
        self.assertEqual(
            response.status_code, status.HTTP_204_NO_CONTENT
        )  # Check for no content response
        self.user.refresh_from_db()
        self.assertFalse(
            self.user.isActive
        )  # Check that the user is marked as inactive
        print("Deletion Test Success!")
