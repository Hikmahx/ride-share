from rest_framework import serializers
from ..models import Vehicle

class NewVehicleSerializer(serializers.ModelSerializer):
  class Meta:
    model = Vehicle
    fields = '__all__'
    
    def validate(self, value):
      # Get the user from the request
      user = self.context['request'].user
      
      # Check if the user already has a vehicle
      existing_vehicle = Vehicle.objects.filter(driver=user).exists()
      if existing_vehicle:
            raise serializers.ValidationError("User already has a vehicle.")
      return value
    
      def create(self, validated_data):
        # Get the user from the request context
        user = self.context['request'].user
        
        # Set the authenticated user as the driver of the new vehicle
        validated_data['driver'] = user
        
        # Create and return the new vehicle instance
        return Vehicle.objects.create(**validated_data)
    

class VehicleSerializer(serializers.ModelSerializer):
  class Meta:
    model = Vehicle
    fields = '__all__'