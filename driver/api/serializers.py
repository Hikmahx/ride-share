from rest_framework import serializers
from ..models import DriverRide


class DriverRideSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriverRide
        fields = ('pickupLocation', 'dropoffLocation',
                  'seatsAvailable', 'price')
        read_only_fields = ('driver', 'vehicle',)

    def create(self, validated_data):
        # Get the user from the request
        driver = self.context['request'].user
        vehicle = self.context['request'].user.vehicle
        print(vehicle)

        # Set the authenticated user as the driver of the new DriverRide
        validated_data['driver'] = driver
        validated_data['vehicle'] = vehicle


        # Create and return the new DriverRide instance
        return DriverRide.objects.create(**validated_data)

    def to_representation(self, instance):  # to be updated later for passenger ride
        """
        Convert the model instance into a dictionary representation.
        This method is used to customize how the model data is represented in JSON format.
        """
        representation = super().to_representation(instance)

        # With this model, I can show an empty array for passengers in the JSON response which I couldn't initially do
        representation['passengers'] = []
        return representation
