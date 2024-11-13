from .models import Supplier


def check_supplier_exists(supplier_data):
    return Supplier.objects.filter(
        Supp_Company_Name=supplier_data["Supp_Company_Name"],
        Supp_Company_Num=supplier_data["Supp_Company_Num"],
    ).exists()


def add_supplier(supplier_data):
    return Supplier.objects.create(
        Supp_Company_Name=supplier_data["Supp_Company_Name"],
        Supp_Company_Num=supplier_data["Supp_Company_Num"],
        Supp_Contact_Pname=supplier_data["Supp_Contact_Pname"],
        Supp_Contact_Num=supplier_data["Supp_Contact_Num"],
    )


def get_existing_supplier_id(supplier_data):

    supplier = Supplier.objects.filter(
        Supp_Company_Name=supplier_data["Supp_Company_Name"],
        Supp_Company_Num=supplier_data["Supp_Company_Num"],
    ).first()
    return supplier.id if supplier else None
