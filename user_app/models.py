from django.db import models
# from django.contrib.auth.models import User 

from django.contrib.auth.models import AbstractUser

# Create your models here.
# class Profile(models.Model):
class Profile(AbstractUser):
    ROLE_CHOICES = [
        ('passenger', 'Passenger'),
        ('driver', 'Driver'),
        ('admin', 'Admin'),
    ]
   
    email = models.EmailField(
        verbose_name='email address',
        max_length=255,
        unique=True,
    )
    username = None
    phone_number = models.CharField(max_length=20, unique=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='passenger')
    verified = models.BooleanField(default=False)
    location = models.CharField(max_length=255)
    
    created_at = models.DateTimeField(auto_now_add=True) 
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = [] # Email & Password are required by default.


    def __str__(self):
        return "{} {} -{}".format(self.first_name, self.last_name, self.email)
        # return self.email