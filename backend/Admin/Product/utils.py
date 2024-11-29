from .models import Product, ProductCategory, ProductDetails
from django.db.models import Max


def check_product_exists(product_name):
    """
    Checks if a product exists by its name.
    Returns True if it exists, otherwise False.
    """
    return Product.objects.filter(PROD_NAME=product_name).exists()


def add_product(product_name, supplier_name):
    """
    Adds a new product to the database with the provided product name and supplier.
    Creates a default ProductDetails with PROD_CAT_CODE set to 1.
    Returns the created Product instance.
    """
    # Check if the product already exists
    existing_product = Product.objects.filter(PROD_NAME=product_name).first()
    if existing_product:
        print(f"Product {product_name} already exists. Skipping creation.")
        return existing_product  # Return the existing product

    # Ensure that a default ProductCategory with PROD_CAT_CODE = 1 exists
    default_category, _ = ProductCategory.objects.get_or_create(
        PROD_CAT_CODE=1,
        defaults={
            "PROD_CAT_NAME": "Default Category",
            "PROD_CAT_SUBCATEGORY": "Default Subcategory",
        },
    )

    # Fetch the latest PROD_DETAILS_CODE
    latest_prod_details_code = (
        ProductDetails.objects.aggregate(latest_code=Max("PROD_DETAILS_CODE"))[
            "latest_code"
        ]
        or 0  # Default to 0 if no ProductDetails exist
    )
    new_prod_details_code = latest_prod_details_code + 1

    # Create the ProductDetails instance with the incremented PROD_DETAILS_CODE
    product_details = ProductDetails.objects.create(
        PROD_DETAILS_CODE=new_prod_details_code,  # Set the new code
        PROD_DETAILS_DESCRIPTION=f"Details for {product_name}",
        PROD_DETAILS_SUPPLIER=supplier_name,  # Assign the supplier name
        PROD_CAT_CODE=default_category,  # Link to the default category
    )

    # Create the Product instance and associate it with the ProductDetails
    product = Product.objects.create(
        PROD_NAME=product_name,
        PROD_DETAILS_CODE=product_details,  # Link to the ProductDetails instance
    )

    return product


def get_existing_product_(product_name):

    product = Product.objects.filter(PROD_NAME=product_name).first()
    return product.id if product else None
