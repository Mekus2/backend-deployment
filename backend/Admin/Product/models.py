from django.db import models


class ProductCategory(models.Model):
    PROD_CAT_CODE = models.AutoField(primary_key=True)
    PROD_CAT_NAME = models.CharField(max_length=255, blank=False, null=False)
    PROD_CAT_SUBCATEGORY = models.CharField(max_length=255, blank=False, null=False)

    def __str__(self):
        return self.PROD_CAT_NAME


class ProductDetails(models.Model):
    PROD_DETAILS_CODE = models.AutoField(primary_key=True)
    PROD_DETAILS_DESCRIPTION = models.CharField(max_length=255)
    PROD_DETAILS_PRICE = models.DecimalField(max_digits=10, decimal_places=2)
    PROD_DETAILS_SUPPLIER = models.CharField(max_length=255)
    PROD_DETAILS_QUANTITY = models.IntegerField(default=0)
    PROD_DETAILS_UNIT = models.CharField(max_length=255, null=True)
    PROD_DETAILS_PACKAGING = models.CharField(max_length=255)
    PROD_CAT_CODE = models.ForeignKey(
        ProductCategory, on_delete=models.CASCADE, blank=False, null=False
    )

    def __str__(self):
        return self.PROD_DETAILS_DESCRIPTION


class Product(models.Model):
    PROD_NAME = models.CharField(max_length=255, unique=False)
    PROD_DETAILS_CODE = models.ForeignKey(
        ProductDetails, on_delete=models.CASCADE, null=True
    )
    PROD_RO_LEVEL = models.IntegerField(default=0)  # Consider using IntegerField
    PROD_RO_QTY = models.IntegerField(default=0)  # Use IntegerField with default
    PROD_QOH = models.IntegerField(default=0)  # Use IntegerField for quantity
    PROD_IMAGE = models.ImageField(upload_to="Prod_image", blank=True, null=True)
    PROD_DATECREATED = models.DateTimeField(auto_now_add=True)
    PROD_DATEUPDATED = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.PROD_NAME
