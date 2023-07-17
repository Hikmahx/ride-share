from rest_framework import serializers
from ..models import Profile
from django.contrib.auth import authenticate


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'
        read_only_fields = ('verified',)  # Mark 'verified' field as read-only

    def save(self):
        if Profile.objects.filter(email=self.validated_data['email']).exists():
            raise serializers.ValidationError(
                {'error': 'Email already exists!'})

        account = Profile(email=self.validated_data['email'])
        account.save()

        return account


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Profile
        fields = ('id', 'firstname', 'lastname', 'email',
                  'phone_number', 'password', 'role', 'verified', 'location')
        extra_kwargs = {'password': {'write_only': True}}
        read_only_fields = ('verified',)  # Mark 'verified' field as read-only

    def create(self, validated_data):
        user = Profile.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            phone_number=validated_data['phone_number'],
            role=validated_data['role'],
            location=validated_data['location'],
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(username=data['email'], password=data['password'])
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Incorrect credentials")
