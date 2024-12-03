"""
URL configuration for PHILVETS project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("", include("Login.urls")),
    path("admin/", admin.site.urls),
    path("api/orders/", include("Admin.Order.Request.urls")),
    path("api/customer-order/", include("Admin.Order.Sales_Order.urls")),
    path("api/supplier-order/", include("Admin.Order.Purchase.urls")),
    path("forgot/", include("ForgotPass.urls")),
    path("account/", include("Account.urls")),
    path("customer/", include("Admin.Customer.urls")),
    path("items/", include("Admin.Product.urls")),
    path("supplier/", include("Admin.Supplier.urls")),
    path("api/delivery/", include("Admin.Delivery.urls")),
    path("api/delivery/issue/", include("Admin.Issue.urls")),
    path("inventory/", include("Admin.Inventory.urls")),
    path("logs/", include("Admin.Logs.urls")),
    path("sales/", include("Admin.Sales.urls")),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
