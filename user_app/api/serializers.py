from rest_framework import serializers
from ..models import Profile
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        # fields = '__all__'
        fields = ['id', 'firstname', 'lastname', 'email',
                  'phone_number', 'role', 'location', 'verified', 'created_at', 'updated_at']
        # read_only_fields = ('verified',)  # Mark 'verified' field as read-only
        # exclude = ('password', 'is_superuser', 'groups', 'user_permissions')

    def save(self):
        if Profile.objects.filter(email=self.validated_data['email']).exists():
            raise serializers.ValidationError(
                {'error': 'Email already exists!'})

        account = Profile(email=self.validated_data['email'])
        account.save()

        return account


class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(label='Confirm Password',
                                      style={"input_type": "password"}, write_only=True)

    class Meta:
        model = Profile
        fields = ['firstname', 'lastname', 'email',
                  'password', 'password2', 'phone_number', 'role', 'location']
        extra_kwargs = {
            'password': {'write_only': True}
        }
        read_only_fields = ('verified',)  # Mark 'verified' field as read-only

    def save(self):
        user = Profile(email=self.validated_data['email'], firstname=self.validated_data['firstname'], lastname=self.validated_data['lastname'],
                       role=self.validated_data['role'], location=self.validated_data['location'], phone_number=self.validated_data['phone_number'])
        password = self.validated_data['password']
        password2 = self.validated_data['password2']
        if password != password2:
            raise serializers.ValidationError(
                {'password': 'Passwords must match.'})
        user.set_password(password)
        user.save()
        return user

    def create(self, validated_data):
        # password = validated_data.pop('password')
        # user = self.Meta.model(**validated_data)
        # user.set_password(password)
        # user.save()

        user = Profile.objects.create_user(
            firstname=validated_data['firstname'],
            lastname=validated_data['lastname'],
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
        if user:
            return user
        raise serializers.ValidationError("Incorrect credentials")


class JWTSerializer(serializers.Serializer):
    token = serializers.CharField()

# class LogoutSerializer(serializers.Serializer):
#     refresh_token = serializers.CharField()

#     def validate(self, attrs):
#         refresh_token = attrs.get('refresh_token')
#         token = RefreshToken(refresh_token)

#         try:
#             token.blacklist()
#         except TokenError:
#             raise serializers.ValidationError('Invalid token')

#         return attrs


class LogoutSerializer(serializers.Serializer):
    pass
