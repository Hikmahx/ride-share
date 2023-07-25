from django.urls import path, include
from .views import VehicleAPI, UpdateVehicleAPI

urlpatterns = [
    path('', VehicleAPI.as_view(), name='driver-vehicle'),
    path('update/', UpdateVehicleAPI.as_view(), name='update-vehicle'),
]
