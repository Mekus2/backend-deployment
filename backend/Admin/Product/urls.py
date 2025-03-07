from django.urls import path
from .views import (
    ProductCategoryManager,
    ProductManager,
    ProductDetailsManager,
    ProductListManager,
    ProductCategoryFilterView,
    ProductSearchView,
    ProductCountView,
    CategoryCountView,
    LowStockProductsView,
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
        "product-details/<int:pk>/",
        ProductDetailsManager.as_view(),
        name="product-details-detail",
    ),  # For single record
    path(
        "product-details/", ProductDetailsManager.as_view(), name="product-details-list"
    ),  # For all records
    # Path for product search using SQL LINK
    path(
        "search/", ProductSearchView.as_view(), name="product-search"
    ),  # Search products with query
    # Path for Total Products
    path("total/", ProductCountView.as_view(), name="product-count"),
    # Path for Total Categories
    path("totalCategories/", CategoryCountView.as_view(), name="category-count"),
    # PATH FOR LOWSTOCK
    path("lowStock/", LowStockProductsView.as_view(), name="Low Stock"),
]
