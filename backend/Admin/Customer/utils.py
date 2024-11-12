# customer/utils.py

from .models import Clients


def check_customer_exists(customer_data):
    return Clients.objects.filter(
        name=customer_data["name"], address=customer_data["address"]
    ).exists()


def add_customer(customer_data):
    return Clients.objects.create(
        name=customer_data["name"],
        address=customer_data["address"],
        province=customer_data["province"],
        phoneNumber=customer_data["phoneNumber"],
    )


def get_existing_customer_id(customer_data):
    """
    Fetches the ID of an existing customer based on the provided data.
    Returns None if the customer does not exist.
    """
    customer = Clients.objects.filter(
        name=customer_data["name"], address=customer_data["address"]
    ).first()
    return customer.id if customer else None
