# urls.py
from django.urls import path
from .views import SalesInvoiceListView, AddPaymentandTerms, SalesReportView

urlpatterns = [
    path("list/", SalesInvoiceListView.as_view(), name="sales_invoice_list"),
    path(
        "<str:invoice_id>/payment",
        AddPaymentandTerms.as_view(),
        name="update_invoice",
    ),
    path("sales-report/", SalesReportView.as_view(), name="sales-report-list"),
]
