

# Create your models here.
from django.db import models
from django.core.exceptions import ValidationError
import re

# --- Custom Validators ---

def validate_name(value):
    if not re.fullmatch(r'[A-Za-z\s]{3,50}', value):
        raise ValidationError("Name must be 3-50 characters, letters and spaces only.")

def validate_mobile(value):
    if not re.fullmatch(r'\d{10}', value):
        raise ValidationError("Mobile number must be exactly 10 digits.")

def validate_password(value):
    if not re.fullmatch(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$', value):
        raise ValidationError(
            "Password must be at least 8 characters long and include uppercase, lowercase, digit, and special character."
        )

def validate_vehicle_number(value):
    if not re.fullmatch(r'[A-Z]{2}\d{2}[A-Z]{2}\d{4}', value):
        raise ValidationError("Invalid Vehicle Number format. Expected format: AP34DH5001")
# --- Model ---

class sellerRegisteredTable(models.Model):
    name = models.CharField(max_length=50, validators=[validate_name])
    email = models.EmailField(unique=True)
    loginid = models.CharField(max_length=30, unique=True)
    mobile = models.CharField(max_length=10, validators=[validate_mobile])
    password = models.CharField(max_length=128, validators=[validate_password])
    status = models.CharField(max_length=20, default='waiting')  # Default value added here
    bank_account_number = models.CharField(max_length=50, null=True, blank=True)
    ifsc_code = models.CharField(max_length=20, null=True, blank=True)
    bank_name = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.loginid
from django.db import models

class Vehicle(models.Model):
    vehicle_number = models.CharField(max_length=50, unique=True, validators=[validate_vehicle_number])
    seller_id = models.IntegerField(null=True, blank=True)
    picture = models.ImageField(upload_to='vehicles/', null=True, blank=True)
    accidents_history = models.TextField(null=True, blank=True)
    ownership_documents = models.FileField(upload_to='documents/', null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    block_hash = models.CharField(max_length=66, null=True, blank=True)
    status = models.CharField(max_length=20, default='available', choices=[
        ('available', 'Available'),
        ('pending', 'Pending'),
        ('sold', 'Sold')
    ])

    def __str__(self):
        return self.vehicle_number