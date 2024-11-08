from django.urls import path
from .views import (
    ProductCategoryManager,
    ProductManager,
    ProductDetailsManager,
    ProductListManager,
    ProductCategoryFilterView,
    ProductSearchView,
)

urlpatterns = [
    # Path for categories
    path(
        "categories/", ProductCategoryManager.as_view(), name="product-categories"
    ),  # for GET and POST
    path(
        "categories/<int:pk>/", ProductCategoryManager.as_view(), name="category-update"
    ),  # for PUT and DELETE
    # Path for categories by getting its category name or subcategory
    path(
        "categoryName/",
        ProductCategoryFilterView.as_view(),
        name="category_name_or_subcategory",
    ),
    # Path for Products
    path(
        "products/", ProductManager.as_view(), name="product-list"
    ),  # for GET and POST
    # To view the product along with its details.
    path(
        "productList/", ProductListManager.as_view(), name="product-details-list"
    ),  # for GET with details
    path(
        "productList/<int:pk>/",
        ProductListManager.as_view(),
        name="product-details-info",
    ),
    path(
        "products/<int:pk>/", ProductManager.as_view(), name="product-update"
    ),  # for GET, PUT, and DELETE
    # Path for Product Details
    path(
        "product-details/", ProductDetailsManager.as_view(), name="product-details-list"
    ),  # for GET and POST
    path(
        "product-details/<int:pk>/",
        ProductDetailsManager.as_view(),
        name="product-detail-update",
    ),  # for GET, PUT, and DELETE
    # Path for product search using SQL LINK
    path(
        "search/", ProductSearchView.as_view(), name="product-search"
    ),  # Search products with query
]
