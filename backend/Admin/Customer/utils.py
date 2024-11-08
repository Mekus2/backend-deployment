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
