from django.urls import path, include
from .views import (
    CreateRideAPI,
    GetAllRidesAPI,
    GetRideByIdAPI,
    GetRideRequestsAPI,
    GetRideRequestsByIdAPI,
    UpdateRideAPI,
    AcceptRideRequestAPI,
    RemovePassengerAPI,
    DeleteRideAPI
)

urlpatterns = [
    # Create a new ride (driver)
    path('', CreateRideAPI.as_view(), name='create-ride'),

    # Get list of rides created by driver
    path('list/', GetAllRidesAPI.as_view(), name='get-all-rides'),

    # Get a ride by the ride's id
    path('<int:rideId>/', GetRideByIdAPI.as_view(), name='get-ride-by-id'),

    # Get ride requests for a specific ride
    path('<int:rideId>/requests/', GetRideRequestsAPI.as_view(),
         name='get-ride-requests'),

    # Get request by id for a specific ride
    path('<int:rideId>/requests/<int:requestId>/',
         GetRideRequestsByIdAPI.as_view(), name='get-ride-requests-by-id'),

    # Update a ride created by the driver
    path('<int:rideId>/update/', UpdateRideAPI.as_view(), name='update-ride'),

    # Accept or cancel a ride request (Driver)
    path('<int:rideId>/requests/<int:requestId>/accept/',
         AcceptRideRequestAPI.as_view(), name='accept-ride-request'),

    # Remove a passenger from a ride
    path('<int:rideId>/passengers/<int:requestId>/remove/',
         RemovePassengerAPI.as_view(), name='remove-passenger'),

    # Delete a ride
    path('<int:rideId>/delete/', DeleteRideAPI.as_view(), name='delete-ride'),
]
