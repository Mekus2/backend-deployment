from rest_framework import serializers
from .models import ProductCategory, Product, ProductDetails


class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = "__all__"


class ProductDetailsSerializer(serializers.ModelSerializer):  # noqa:F811
    class Meta:
        model = ProductDetails
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):
    PROD_IMAGE = serializers.ImageField(
        required=False, allow_null=True
    )  # Allow image to be optional

    PROD_DETAILS = ProductDetailsSerializer(
        write_only=True,
    )  # Use nested serializer for product details

    class Meta:
        model = Product
        fields = [
            "PROD_NAME",
            "PROD_RO_LEVEL",
            "PROD_RO_QTY",
            "PROD_QOH",
            "PROD_IMAGE",
            "PROD_DETAILS",
        ]

    def create(self, validated_data):
        # Extract ProductDetails data from the validated_data
        product_details_data = validated_data.pop("PROD_DETAILS")

        # Automatically generate PROD_DETAILS_CODE as an integer (incrementing)
        prod_details_code = ProductDetails.objects.count() + 1  # E.g., 1, 2, 3, ...
        product_details = ProductDetails.objects.create(
            PROD_DETAILS_CODE=prod_details_code, **product_details_data
        )

        # Handle image, treat empty string as None
        image = validated_data.pop(
            "PROD_IMAGE", None
        )  # Remove PROD_IMAGE from validated_data
        if image == "":
            image = None  # If image is an empty string, treat it as None

        # Create the Product instance, linking to ProductDetails
        product = Product.objects.create(
            PROD_DETAILS_CODE=product_details, PROD_IMAGE=image, **validated_data
        )

        return product


class ProductReadSerializer(serializers.ModelSerializer):
    PROD_DETAILS = ProductDetailsSerializer(
        source="PROD_DETAILS_CODE", read_only=True
    )  # View-only details

    class Meta:
        model = Product
        fields = [
            "id",
            "PROD_NAME",
            "PROD_RO_LEVEL",
            "PROD_RO_QTY",
            "PROD_QOH",
            "PROD_IMAGE",
            "PROD_DATECREATED",
            "PROD_DATEUPDATED",
            "PROD_DETAILS_CODE",
            "PROD_DETAILS",  # Include PROD_DETAILS for read
        ]

    def update(self, instance, validated_data):
        # Update the Product instance
        instance.PROD_NAME = validated_data.get("PROD_NAME", instance.PROD_NAME)
        instance.PROD_RO_LEVEL = validated_data.get(
            "PROD_RO_LEVEL", instance.PROD_RO_LEVEL
        )
        instance.PROD_RO_QTY = validated_data.get("PROD_RO_QTY", instance.PROD_RO_QTY)
        instance.PROD_QOH = validated_data.get("PROD_QOH", instance.PROD_QOH)
        instance.PROD_IMAGE = validated_data.get("PROD_IMAGE", instance.PROD_IMAGE)
        instance.save()

        # Handle the update for product details
        product_details_data = validated_data.get("PROD_DETAILS", {})
        product_details_instance = (
            instance.PROD_DETAILS_CODE
        )  # Get the related ProductDetails instance
        for attr, value in product_details_data.items():
            setattr(product_details_instance, attr, value)
        product_details_instance.save()

        return instance


class ProductWriteSerializer(serializers.ModelSerializer):
    # Include the related ProductDetails for updates
    PROD_DETAILS = ProductDetailsSerializer(source="PROD_DETAILS_CODE", required=False)

    class Meta:
        model = Product
        fields = [
            "id",
            "PROD_NAME",
            "PROD_RO_LEVEL",
            "PROD_RO_QTY",
            "PROD_QOH",
            "PROD_IMAGE",
            "PROD_DETAILS",  # Allow updates for both product and details
        ]

    def update(self, instance, validated_data):
        # Update the Product fields
        instance.PROD_NAME = validated_data.get("PROD_NAME", instance.PROD_NAME)
        instance.PROD_RO_LEVEL = validated_data.get(
            "PROD_RO_LEVEL", instance.PROD_RO_LEVEL
        )
        instance.PROD_RO_QTY = validated_data.get("PROD_RO_QTY", instance.PROD_RO_QTY)
        instance.PROD_QOH = validated_data.get("PROD_QOH", instance.PROD_QOH)
        instance.PROD_IMAGE = validated_data.get("PROD_IMAGE", instance.PROD_IMAGE)
        instance.save()

        # Update the related ProductDetails if present
        product_details_data = validated_data.get("PROD_DETAILS_CODE", None)
        if product_details_data:
            product_details_instance = (
                instance.PROD_DETAILS_CODE
            )  # Get the related instance
            for attr, value in product_details_data.items():
                setattr(product_details_instance, attr, value)
            product_details_instance.save()

        return instance
