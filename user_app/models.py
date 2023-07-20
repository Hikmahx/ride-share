from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class ProfileManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class Profile(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('passenger', 'Passenger'),
        ('driver', 'Driver'),
        # ('admin', 'Admin'),
    ]

    firstname = models.CharField(max_length=255)
    lastname = models.CharField(max_length=255)
    email = models.EmailField(
        verbose_name='email address',
        max_length=255,
        unique=True,
    )
    password = models.CharField(max_length=50)
    phone_number = models.CharField(max_length=20)
    role = models.CharField(
        max_length=50, choices=ROLE_CHOICES, default='passenger')
    verified = models.BooleanField(default=False)
    location = models.CharField(max_length=255)

    is_staff = models.BooleanField(default=False)  # Required for admin interface

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['firstname', 'lastname']

    objects = ProfileManager()

    def __str__(self):
        return "{} {} -{}".format(self.firstname, self.lastname, self.email)
