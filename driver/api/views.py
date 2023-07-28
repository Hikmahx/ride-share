from rest_framework import generics, permissions
from rest_framework.response import Response
from ..models import DriverRide
from .serializers import DriverRideSerializer
from .permissions import HasVehicle

class CreateRideAPI (generics.CreateAPIView):
  queryset = DriverRide.objects.all()
  serializer_class = DriverRideSerializer
  permission_classes = [permissions.IsAuthenticated, HasVehicle,]
  
class GetAllRidesAPI (generics.ListAPIView):
  queryset = DriverRide.objects.all()
  serializer_class = DriverRideSerializer
  permission_classes = [permissions.IsAuthenticated,]
  
class GetRideByIdAPI (generics.RetrieveAPIView):
  queryset = DriverRide.objects.all()
  serializer_class = DriverRideSerializer
  permission_classes = [permissions.IsAuthenticated,]
  
class GetRideRequestsAPI (generics.ListAPIView):
  queryset = DriverRide.objects.all()
  serializer_class = DriverRideSerializer
  permission_classes = [permissions.IsAuthenticated,]
  
class GetRideRequestsByIdAPI (generics.GenericAPIView):
  queryset = DriverRide.objects.all()
  serializer_class = DriverRideSerializer
  permission_classes = [permissions.IsAuthenticated,]

class UpdateRideAPI (generics.UpdateAPIView):
  queryset = DriverRide.objects.all()
  serializer_class = DriverRideSerializer
  permission_classes = [permissions.IsAuthenticated,]

class AcceptRideRequestAPI (generics.UpdateAPIView):
  queryset = DriverRide.objects.all()
  serializer_class = DriverRideSerializer
  permission_classes = [permissions.IsAuthenticated,]
  
class RemovePassengerAPI (generics.UpdateAPIView):
  queryset = DriverRide.objects.all()
  serializer_class = DriverRideSerializer
  permission_classes = [permissions.IsAuthenticated,]
  
class DeleteRideAPI (generics.DestroyAPIView):
  queryset = DriverRide.objects.all()
  serializer_class = DriverRideSerializer
  permission_classes = [permissions.IsAuthenticated,]