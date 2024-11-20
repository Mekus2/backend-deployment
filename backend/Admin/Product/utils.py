from .models import Product


def check_product_exists(product_name):
    """
    Checks if a product exists by its name.
    Returns True if it exists, otherwise False.
    """
    return Product.objects.filter(PROD_NAME=product_name).exists()


def add_product(product_name):
    """
    Adds a new product to the database with the provided product name.
    Returns the created Product instance.
    """
    return Product.objects.create(PROD_NAME=product_name)


def get_existing_product_(product_name):

    product = Product.objects.filter(PROD_NAME=product_name).first()
    return product.id if product else None
