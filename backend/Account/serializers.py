from rest_framework import serializers
from .models import User  # Assuming this is your custom user model


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            "username",
            "password",
            "email",
            "first_name",
            "mid_initial",
            "last_name",
            "phonenumber",
            "address",
            "accType",
            "image",
        )

    def create(self, validated_data):
        # Create a new user instance without saving it yet
        user = User(
            username=validated_data["username"],
            first_name=validated_data["first_name"],
            mid_initial=validated_data.get(
                "mid_initial", ""
            ),  # Use get to avoid KeyError
            last_name=validated_data["last_name"],
            email=validated_data["email"],
            phonenumber=validated_data["phonenumber"],
            address=validated_data["address"],
            accType=validated_data["accType"],
            image=validated_data.get("image", None),  # Use get to avoid KeyError
        )
        user.set_password(validated_data["password"])  # Hash the password
        user.save()  # Save user to the database
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "mid_initial",
            "last_name",
            "phonenumber",
            "address",
            "accType",
            "image",
        )
        extra_kwargs = {
            "username": {"required": False},
            "email": {"required": False},
            "first_name": {"required": False},
            "mid_initial": {"required": False},
            "last_name": {"required": False},
            "phonenumber": {"required": False},
            "address": {"required": False},
            "accType": {"required": False},
            "image": {"required": False},
        }

    def update(self, instance, validated_data):
        # Update the user instance with validated data
        for attr, value in validated_data.items():
            if value is not None:
                setattr(instance, attr, value)
        instance.save()
        return instance
