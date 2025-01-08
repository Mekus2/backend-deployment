# Generated by Django 5.1.3 on 2024-11-08 07:14

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("Customer", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="SalesOrder",
            fields=[
                ("SALES_ORDER_ID", models.AutoField(primary_key=True, serialize=False)),
                ("SALES_ORDER_DATE_CREATED", models.DateTimeField(auto_now_add=True)),
                ("SALES_ORDER_DATE_UPDATED", models.DateTimeField(auto_now=True)),
                (
                    "SALES_ORDER_STATUS",
                    models.CharField(
                        choices=[
                            ("Pending", "Pending"),
                            ("Approved", "Approved"),
                            ("Shipped", "Shipped"),
                            ("Delivered", "Delivered"),
                            ("Cancelled", "Cancelled"),
                        ],
                        default="PENDING",
                        max_length=15,
                    ),
                ),
                ("SALES_ORDER_CLIENT_NAME", models.CharField(max_length=30, null=True)),
                (
                    "SALES_ORDER_CLIENT_PROVINCE",
                    models.CharField(max_length=30, null=True),
                ),
                ("SALES_ORDER_CLIENT_CITY", models.CharField(max_length=30, null=True)),
                (
                    "SALES_ORDER_CLIENT_PHONE_NUM",
                    models.CharField(max_length=13, null=True),
                ),
                (
                    "SALES_ORDER_DLVRY_OPTION",
                    models.CharField(default="Standard Delivery", max_length=30),
                ),
                (
                    "SALES_ORDER_PYMNT_OPTION",
                    models.CharField(default="Cash On Delivery (COD)", max_length=30),
                ),
                ("SALES_ORDER_TOTAL_QTY", models.PositiveIntegerField(default=0)),
                (
                    "SALES_ORDER_TOTAL_PRICE",
                    models.DecimalField(decimal_places=2, default=0, max_digits=10),
                ),
                (
                    "SALES_ORDER_TOTAL_DISCOUNT",
                    models.DecimalField(decimal_places=2, default=0, max_digits=10),
                ),
                (
                    "CLIENT_ID",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="Customer.clients",
                    ),
                ),
                (
                    "SALES_ORDER_CREATEDBY_USER",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="sales_orders_created",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "Sales Order",
                "verbose_name_plural": "Sales Order",
                "db_table": "SALES_ORDER",
            },
        ),
        migrations.CreateModel(
            name="SalesOrderDetails",
            fields=[
                (
                    "SALES_ORDER_DET_ID",
                    models.AutoField(primary_key=True, serialize=False),
                ),
                (
                    "SALES_ORDER_PROD_ID",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="Product.Product",
                    ),
                ),
                ("SALES_ORDER_PROD_NAME", models.CharField(max_length=50)),
                (
                    "SALES_ORDER_LINE_PRICE",
                    models.DecimalField(decimal_places=2, default=0, max_digits=10),
                ),
                ("SALES_ORDER_LINE_QTY", models.PositiveBigIntegerField()),
                (
                    "SALES_ORDER_LINE_DISCOUNT",
                    models.DecimalField(decimal_places=2, default=0, max_digits=10),
                ),
                (
                    "SALES_ORDER_LINE_TOTAL",
                    models.DecimalField(decimal_places=2, default=0, max_digits=10),
                ),
                (
                    "SALES_ORDER_ID",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="sales_order",
                        to="Sales_Order.salesorder",
                    ),
                ),
            ],
            options={
                "verbose_name": "Sales Order Detail",
                "verbose_name_plural": "Sales Order Details",
                "db_table": "SALES_ORDER_DETAILS",
            },
        ),
    ]
