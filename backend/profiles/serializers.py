from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Profile

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'role']
        read_only_fields = ['username', 'role']

class ProfileSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    email = serializers.EmailField(source='user.email')
    first_name = serializers.CharField(source='user.first_name', allow_blank=True)
    last_name = serializers.CharField(source='user.last_name', allow_blank=True)

    class Meta:
        model = Profile
        fields = [
            'id', 'user_details', 'email', 'first_name', 'last_name',
            'bio', 'skills', 'hourly_rate', 'availability', 'location',
            'profile_picture', 'phone_number', 'portfolio_url'
        ]

    def update(self, instance, validated_data):
        # Handle nested user data
        user_data = validated_data.pop('user', {})
        user = instance.user
        
        # Update user fields
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()

        # Update profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance

    def to_internal_value(self, data):
        # Convert empty string to None for decimal fields
        if 'hourly_rate' in data and data['hourly_rate'] == '':
            data = data.copy()
            data['hourly_rate'] = None
        return super().to_internal_value(data)