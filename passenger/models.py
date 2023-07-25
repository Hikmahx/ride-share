from django.db import models
from driver.models import DriverRide
from django.core.validators import MinValueValidator

from user_app.models import Profile

class PassengerRide(models.Model):
    STATUS_CHOICES = [
        ('requested', 'Requested'),
        ('accepted', 'Accepted'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    passenger = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='passenger_rides')
    driver = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='driver_rides')
    ride = models.ForeignKey(DriverRide, on_delete=models.CASCADE)
    pickupLocation = models.CharField(max_length=150)
    dropoffLocation = models.CharField(max_length=150)
    numberOfPassengers = models.IntegerField(validators=[MinValueValidator(1)])
    price = models.IntegerField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='requested')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Passenger Ride - Passenger: {self.passenger}, Driver: {self.driver}, Status: {self.status}"
