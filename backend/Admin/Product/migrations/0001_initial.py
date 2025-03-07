# Generated by Django 5.1.3 on 2025-01-08 09:31

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="ProductCategory",
            fields=[
                ("PROD_CAT_CODE", models.AutoField(primary_key=True, serialize=False)),
                ("PROD_CAT_NAME", models.CharField(max_length=255)),
                ("PROD_CAT_SUBCATEGORY", models.CharField(max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name="ProductDetails",
            fields=[
                (
                    "PROD_DETAILS_CODE",
                    models.AutoField(primary_key=True, serialize=False),
                ),
                (
                    "PROD_DETAILS_DESCRIPTION",
                    models.CharField(default="No Description", max_length=255),
                ),
                (
                    "PROD_DETAILS_PRICE",
                    models.DecimalField(decimal_places=2, default=0, max_digits=10),
                ),
                (
                    "PROD_DETAILS_PURCHASE_PRICE",
                    models.DecimalField(decimal_places=2, default=0, max_digits=10),
                ),
                ("PROD_DETAILS_SUPPLIER", models.CharField(max_length=255, null=True)),
                ("PROD_DETAILS_QUANTITY", models.IntegerField(default=0)),
                ("PROD_DETAILS_UNIT", models.CharField(max_length=255, null=True)),
                ("PROD_DETAILS_PACKAGING", models.CharField(max_length=255, null=True)),
                (
                    "PROD_CAT_CODE",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        to="Product.productcategory",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Product",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("PROD_NAME", models.CharField(max_length=255)),
                ("PROD_RO_LEVEL", models.IntegerField(default=0)),
                ("PROD_RO_QTY", models.IntegerField(default=0)),
                ("PROD_QOH", models.IntegerField(default=0)),
                (
                    "PROD_IMAGE",
                    models.ImageField(blank=True, null=True, upload_to="Prod_image"),
                ),
                ("PROD_DATECREATED", models.DateTimeField(auto_now_add=True)),
                ("PROD_DATEUPDATED", models.DateTimeField(auto_now=True)),
                (
                    "PROD_DETAILS_CODE",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        to="Product.productdetails",
                    ),
                ),
            ],
        ),
    ]
