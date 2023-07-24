from rest_framework import serializers
from ..models import Vehicle


class NewVehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = '__all__'
        read_only_fields = ('driver',)  # Set 'driver' field as read-only

    def create(self, validated_data):
        # Get the user from the request
        driver = self.context['request'].user

        # Check if the user already has a vehicle
        existing_vehicle = Vehicle.objects.filter(driver=driver).exists()
        if existing_vehicle:
            raise serializers.ValidationError(
                {'error': "User already has a vehicle."})

        # Set the authenticated user as the driver of the new vehicle
        validated_data['driver'] = driver

        # Create and return the new vehicle instance
        return Vehicle.objects.create(**validated_data)


class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = '__all__'
