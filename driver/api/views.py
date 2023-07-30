from rest_framework import generics, permissions, status
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


class GetRideByIdAPI(generics.RetrieveAPIView):
    queryset = DriverRide.objects.all()
    serializer_class = DriverRideSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        ride_id = kwargs.get('rideId')
        try:
            # Retrieve the driver ride by its ID
            ride = DriverRide.objects.get(pk=ride_id)
            if ride.driver != request.user:
                return Response({'error': 'Not authorized to view this ride'}, status=status.HTTP_403_FORBIDDEN)

            serializer = DriverRideSerializer(ride)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except DriverRide.DoesNotExist:
            return Response({'error': 'Ride not found'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({'error': 'Failed to retrieve ride details'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetRideRequestsAPI (generics.GenericAPIView):
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
