from django.urls import path, include
from .views import (
    CreateVehicleAPI,
    GetDriverVehicleAPI,
    UpdateVehicleAPI
)

urlpatterns = [
    # Create a new ride (driver)
    path('', CreateVehicleAPI.as_view(), name='create-vehicle'),
    path('', GetDriverVehicleAPI.as_view(), name='get-driver-vehicle'),
    path('<int:pk>/', UpdateVehicleAPI.as_view(), name='update-vehicle'),
]
