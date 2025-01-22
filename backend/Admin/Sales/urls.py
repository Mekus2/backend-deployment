# urls.py
from django.urls import path
from .views import (
    SalesInvoiceListView,
    # SalesReportView,
    AddPaymentView,
    CustomerPayableListView,
    ViewPaymentDetails,
    SalesInvoiceDetailsView,
    MonthlyRevenueIncomeAPI,
)

urlpatterns = [
    # Path for Sales Invoice API
    path("list/", SalesInvoiceListView.as_view(), name="sales_invoice_list"),
    # Path for Sales Report API
    # path("sales-report/", SalesReportView.as_view(), name="sales-report-list"),
    # Path for Updating Customer Payment API
    path("customer-payment/", AddPaymentView.as_view(), name="customer-payment"),
    # Path for Customer Payable List
    path(
        "customer-payment-list/",
        CustomerPayableListView.as_view(),
        name="customer-payment-list",
    ),
    # Path for specific Customer Payable Details
    path(
        "customer-payment-details/<int:payment_id>/",
        ViewPaymentDetails.as_view(),
        name="customer-payment-details",
    ),
    # Path for List of Sales Invoice
    path(
        "sales-invoice-list/", SalesInvoiceListView.as_view(), name="sales-invoice-list"
    ),
    # Path for specific Sales Invoice Details
    path(
        "sales-invoice-details/<str:sales_inv_id>/",
        SalesInvoiceDetailsView.as_view(),
        name="sales-invoice-details",
    ),
    # Path for fetching monthly revenue and income
    path("monthly-sales/", MonthlyRevenueIncomeAPI.as_view(), name="monthly-sales"),
]
