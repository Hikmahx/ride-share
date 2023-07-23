from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import datetime
from user_app.models import Profile
# Create your models here.


class Vehicle(models.Model):
    make = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    color = models.CharField(max_length=50)
    year = models.IntegerField(
        validators=[MinValueValidator(1970), MaxValueValidator(
            datetime.datetime.now().year)]
    )
    plateNumber = models.CharField(max_length=50)
    description = models.CharField(max_length=50)
    seats = models.IntegerField(MinValueValidator(1))
    avatar = models.CharField(max_length=50, default='')
    driver = models.OneToOneField(Profile,
                                  on_delete=models.CASCADE)
    available = models.BooleanField(default=True)
    # location = models.JSONField()  # To store the location data as JSON
    location = models.CharField(max_length=150)

    def __str__(self):
        return f"{self.make} {self.model} - {self.plateNumber}"
