from django.db import models
from django.core.validators import MinValueValidator

from user_app.models import Profile

class DriverRide(models.Model):
    passengers = models.ForeignKey('passenger.PassengerRide', on_delete=models.CASCADE, related_name='driver_rides', null=True)
    driver = models.ForeignKey(Profile, on_delete=models.CASCADE)
    vehicle = models.ForeignKey('vehicle.Vehicle', on_delete=models.CASCADE)
    pickupLocation = models.CharField(max_length=150)
    dropoffLocation = models.CharField(max_length=150)
    seatsAvailable = models.IntegerField(validators=[MinValueValidator(1)])
    price = models.IntegerField()

    def __str__(self):
        return f"Driver Ride - Driver: {self.driver}, Vehicle: {self.vehicle}, Seats Available: {self.seatsAvailable}"
