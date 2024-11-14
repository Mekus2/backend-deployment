from rest_framework import serializers
from .models import Supplier


class CreateSupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = (
            "Supp_Company_Name",
            "Supp_Company_Num",
            "Supp_Contact_Pname",
            "Supp_Contact_Num",
        )


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = "__all__"
