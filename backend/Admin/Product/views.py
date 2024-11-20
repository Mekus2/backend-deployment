from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, permissions
from Admin.authentication import CookieJWTAuthentication
from django.db.models import Q
from .models import ProductCategory, ProductDetails, Product
from .serializers import (
    ProductCategorySerializer,
    ProductDetailsSerializer,
    ProductSerializer,
    ProductReadSerializer,
    ProductWriteSerializer,
)


class ProductDetailsManager(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk=None):
        if pk is not None:
            try:
                # Query by PROD_DETAILS_CODE (which is the primary key)
                details = ProductDetails.objects.get(PROD_DETAILS_CODE=pk)
                serializer = ProductDetailsSerializer(details)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except ProductDetails.DoesNotExist:
                return Response({"error": "Details not found."}, status=status.HTTP_404_NOT_FOUND)

        # If no `pk` is provided, return all records
        queryset = ProductDetails.objects.all()
        serializer = ProductDetailsSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
       
    def put(self, request, pk=None):
        if pk:
            try:
                # Fetch the ProductDetails instance by its primary key
                product_details = ProductDetails.objects.get(pk=pk)

                # Serialize the ProductDetails instance to accept update data
                serializer = ProductDetailsSerializer(product_details, data=request.data, partial=False)

                if serializer.is_valid():
                    serializer.save()  # Save the updated ProductDetails instance
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except ProductDetails.DoesNotExist:
                return Response({"detail": "ProductDetails not found."}, status=status.HTTP_404_NOT_FOUND)


class ProductListManager(APIView):
    # authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk=None):
        if pk:
            product = get_object_or_404(Product, pk=pk)
            serializer = ProductReadSerializer(product)
            return Response(serializer.data)

        queryset = Product.objects.all().order_by("-pk")
        serializer = ProductReadSerializer(queryset, many=True)
        return Response(serializer.data)

    def put(self, request, pk):
        # Update a product by primary key
        product = get_object_or_404(Product, pk=pk)
        serializer = ProductWriteSerializer(
            product, data=request.data, partial=True
        )  # partial=True allows partial updates
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductCategoryManager(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk=None):
        # If pk is provided, fetch a single product category
        if pk is not None:
            try:
                category = ProductCategory.objects.get(pk=pk)
                serializer = ProductCategorySerializer(category)
                return Response(serializer.data)
            except ProductCategory.DoesNotExist:
                return Response({"error": "Category not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # If no pk is provided, return all categories
        queryset = ProductCategory.objects.all()
        serializer = ProductCategorySerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ProductCategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()  # PROD_CAT_CODE will be auto-generated
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk=None):
        try:
            # Get the category instance to update
            category = ProductCategory.objects.get(pk=pk)
        except ProductCategory.DoesNotExist:
            return Response({"error": "Category not found."}, status=status.HTTP_404_NOT_FOUND)

        # Deserialize and update the instance
        serializer = ProductCategorySerializer(
            category, data=request.data, partial=True
        )  # partial=True allows updating some fields
        if serializer.is_valid():
            serializer.save()  # Save the changes to the category
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk=None):
        try:
            category = ProductCategory.objects.get(pk=pk)
        except ProductCategory.DoesNotExist:
            return Response(
                {"error": "Category not found."}, status=status.HTTP_404_NOT_FOUND
            )  # Return error message if not found

        category.delete()  # Delete the category
        return Response(
            {"message": "Category deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )  # Return success message



class ProductCategoryFilterView(APIView):
    # authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.AllowAny]
    """
    This class is for fetching product categories by name or subcategory.
    """

    def get(self, request):
        prod_cat_name = request.query_params.get("prod_cat_name", None)
        prod_cat_subcategory = request.query_params.get("prod_cat_subcategory", None)

        queryset = ProductCategory.objects.all()

        if prod_cat_name:
            queryset = queryset.filter(PROD_CAT_NAME__icontains=prod_cat_name)

        if prod_cat_subcategory:
            queryset = queryset.filter(PROD_CAT_SUBCATEGORY__icontains=prod_cat_subcategory)

        serializer = ProductCategorySerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProductManager(APIView):
    # authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        queryset = Product.objects.all()
        serializer = ProductSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Product successfully added!", "product": serializer.data},
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {"message": "Failed to add product.", "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def put(self, request, pk=None):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = ProductSerializer(product, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk=None):
        try:
            product = Product.objects.get(pk=pk)
            product.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Product.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


class ProductDetailsManager(APIView):  # noqa:F811
    # authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        queryset = ProductDetails.objects.all()
        serializer = ProductDetailsSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ProductDetailsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk=None):
        try:
            product_detail = ProductDetails.objects.get(
                PROD_DETAILS_CODE=pk
            )  # Assuming PROD_DETAILS_CODE is the primary key
        except ProductDetails.DoesNotExist:
            return Response(
                {"error": "Product details not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ProductDetailsSerializer(product_detail, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductSearchView(APIView):
    # authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.AllowAny]
    """
    This view searches for products by name using the LIKE operator (case-insensitive).
    """

    def get(self, request):
        query = request.query_params.get("q", None)  # Get search query parameter 'q'

        if query:
            # Perform a case-insensitive search on the 'PROD_NAME' field
            products = Product.objects.filter(PROD_NAME__icontains=query)
        else:
            return Response(
                {"error": "No query parameter provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not products.exists():
            return Response(
                {"message": "No products found matching the query."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Serialize the filtered product list
        serializer = ProductReadSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class ProductCountView(APIView):
    authenticaton_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.AllowAny]  # Optional: limit access to authenticated users

    def get(self, request):
        total_products = Product.objects.count()
        return Response({ total_products})
    
class CategoryCountView(APIView):
    authentication_classes  = [CookieJWTAuthentication]
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        total_categories = ProductCategory.objects.count()
        return Response({total_categories})