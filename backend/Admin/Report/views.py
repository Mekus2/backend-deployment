from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime
from .models import Reports, ReportDetails
from .serializers import ReportsSerializer
from Admin.Product.models import Product  # Ensure the Product model is correctly imported
from Admin.Inventory.models import Inventory  # Ensure the Inventory model is correctly imported
from Admin.authentication import CookieJWTAuthentication
from rest_framework.permissions import AllowAny

class ReportAPIView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        report = Reports.objects.all()
        serializer = ReportsSerializer(report, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ReportsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DailyReportAPIView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        # Get today's date
        today = datetime.today().date()

        # Check if a report already exists for today to avoid duplication
        existing_report = Reports.objects.filter(REPORT_TYPE='Daily', REPORT_DATETIME__date=today).first()
        if existing_report:
            return Response({'error': 'Daily report for today already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        # Get all products
        products = Product.objects.all()

        # Prepare report data and report details
        report_data = []
        report_details = []
        for product in products:
            # Get the latest inventory entry for each product (based on the most recent DATE_CREATED)
            inventory_entries = Inventory.objects.filter(PRODUCT_ID=product).order_by('DATE_CREATED')

            if inventory_entries.exists():
                # Opening stock is the first entry for the product (earliest entry)
                opening_stock = inventory_entries.first().QUANTITY_ON_HAND  
                # Current stock is the latest inventory entry (most recent entry)
                current_stock = inventory_entries.last().QUANTITY_ON_HAND  
            else:
                opening_stock = 0
                current_stock = 0

            outbound_quantity = product.PROD_RO_QTY  # Outbound quantity from the Product model

            # Add data for the report
            report_data.append({
                'product_name': product.PROD_NAME,
                'opening_stock': opening_stock,
                'current_stock': current_stock,
                'outbound_quantity': outbound_quantity,
                'date': today,
            })

            # Add to report details
            report_details.append(ReportDetails(
                product=product,
                opening_stock=opening_stock,
                current_stock=current_stock,
                outbound_quantity=outbound_quantity
            ))

        # Create a new report entry
        report_title = f"Daily Inventory Report - {today}"
        report_description = "This is the daily report for inventory status and outbound products."
        report = Reports(
            REPORT_TYPE='Daily',
            REPORT_DATETIME=datetime.now(),
            REPORT_TITLE=report_title,
            REPORT_DESCRIPTION=report_description,
        )
        report.save()

        # Save the report details
        for detail in report_details:
            detail.report = report  # Associate each detail with the report
            detail.save()

        # Return the report data
        return Response(report_data, status=status.HTTP_200_OK)

class ViewDailyReportAPIView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        # Get today's date
        today = datetime.today().date()

        # Retrieve the report for today
        existing_report = Reports.objects.filter(REPORT_TYPE='Daily', REPORT_DATETIME__date=today).first()
        if not existing_report:
            return Response({'error': 'No daily report found for today.'}, status=status.HTTP_404_NOT_FOUND)

        # Retrieve the report details
        report_details = ReportDetails.objects.filter(report=existing_report)

        # Prepare the report data to return
        report_data = []
        for detail in report_details:
            report_data.append({
                'product_name': detail.product.PROD_NAME,
                'opening_stock': detail.opening_stock,
                'current_stock': detail.current_stock,
                'outbound_quantity': detail.outbound_quantity,
                'date': today,
            })

        # Return the report data
        return Response(report_data, status=status.HTTP_200_OK)

class OutboundProductAPIView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        # Get all products
        products = Product.objects.all()

        # Prepare the outbound product data
        outbound_products = []

        for product in products:
            # Get the inventory entries for the product ordered by creation date
            inventory_entries = Inventory.objects.filter(PRODUCT_ID=product).order_by('DATE_CREATED')

            if inventory_entries.exists():
                # Opening stock: the first entry
                opening_stock = inventory_entries.first().QUANTITY_ON_HAND
                # Current stock: the last entry
                current_stock = inventory_entries.last().QUANTITY_ON_HAND
                # Date of the most recent inventory entry
                date_created = inventory_entries.last().DATE_CREATED
            else:
                opening_stock = 0
                current_stock = 0
                date_created = 'N/A'

            # Outbound quantity from the Product model
            outbound_quantity = product.PROD_RO_QTY

            # Add data for the outbound product
            outbound_products.append({
                'product_name': product.PROD_NAME,
                'opening_stock': opening_stock,
                'current_stock': current_stock,
                'outbound_quantity': outbound_quantity,
                'date': str(date_created) if date_created != 'N/A' else 'N/A',
            })

        # Return the outbound product data
        return Response(outbound_products, status=status.HTTP_200_OK)