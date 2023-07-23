from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from vehicle.models import Vehicle
from .serializers import VehicleSerializer, NewVehicleSerializer
from user_app.api.permissions import IsDriver

class CreateVehicleAPI(generics.CreateAPIView):
    queryset = Vehicle.objects.all()
    serializer_class = NewVehicleSerializer
    permission_classes = [IsAuthenticated, IsDriver]

class GetDriverVehicleAPI(generics.RetrieveAPIView):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return Vehicle.objects.filter(driver=self.request.user.id).first()

class UpdateVehicleAPI(generics.UpdateAPIView):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated]