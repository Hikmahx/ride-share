from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from vehicle.models import Vehicle
from .serializers import NewVehicleSerializer, VehicleSerializer
from user_app.api.permissions import IsDriver

class VehicleAPI(generics.ListCreateAPIView):
    queryset = Vehicle.objects.all()
    serializer_class = NewVehicleSerializer
    permission_classes = [IsAuthenticated, IsDriver]

    def get_queryset(self):
        # Retrieve vehicles for the authenticated driver
        return Vehicle.objects.filter(driver=self.request.user)

    def create(self, request, *args, **kwargs):
        # Set the authenticated user as the driver of the new vehicle
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(driver=self.request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    

class UpdateVehicleAPI(generics.UpdateAPIView):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Retrieve the vehicle for the authenticated driver
        return Vehicle.objects.get(driver=self.request.user)
