

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
# --- Model ---

class userRegisteredTable(models.Model):
    name = models.CharField(max_length=50, validators=[validate_name])
    email = models.EmailField(unique=True)
    loginid = models.CharField(max_length=30, unique=True)
    mobile = models.CharField(max_length=10, validators=[validate_mobile])
    password = models.CharField(max_length=128, validators=[validate_password])
    status = models.CharField(max_length=20, default='waiting')  # Default value added here

    def __str__(self):
        return self.loginid


class Vehicle1(models.Model):
    purchased_at = models.DateTimeField(null=True, blank=True)
    vehicle_number = models.CharField(max_length=50, unique=True)
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

class Transaction(models.Model):
    vehicle_number = models.CharField(max_length=50)
    buyer_id = models.IntegerField()
    buyer_name = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    hash_code = models.CharField(max_length=100)
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.vehicle_number} - {self.buyer_name}"