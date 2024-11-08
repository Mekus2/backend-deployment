from django.db import models

# Create your models here.


class SupplierManager(models.Manager):
    def create_supplier(
        self, Supp_Company_Name, Supp_Company_Num, Supp_Contact_Pname, Supp_Contact_Num
    ):
        if not Supp_Company_Name:
            raise ValueError("Name is required")
        if not Supp_Company_Num:
            raise ValueError("Company name is required")

        supplier = self.model(
            Supp_Company_Name=Supp_Company_Name,
            Supp_Company_Num=Supp_Company_Num,
            Supp_Contact_Pname=Supp_Contact_Pname,
            Supp_Contact_Num=Supp_Contact_Num,
        )
        supplier.save(using=self._db)
        return supplier


class Supplier(models.Model):
    Supp_Company_Name = models.CharField(max_length=255, blank=False, null=False)
    Supp_Company_Num = models.CharField(max_length=15, blank=False, null=False)
    Supp_Contact_Pname = models.CharField(max_length=255, blank=False, null=False)
    Supp_Contact_Num = models.CharField(max_length=15, blank=False, null=False)

    objects = SupplierManager()  # Register Supplier Manager

    def __str__(self):
        return self.Supp_Company_Name
