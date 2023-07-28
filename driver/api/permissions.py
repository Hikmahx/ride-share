from rest_framework import permissions
from vehicle.models import Vehicle


class HasVehicle(permissions.BasePermission):
    """
    Check if the driver has a vehicle
    """

    def has_permission(self, request, view):
        try:
            vehicle = Vehicle.objects.get(driver=request.user)
            return True
        except Vehicle.DoesNotExist:
            self.message = "Driver need a vehicle before creating a ride."
            return False
