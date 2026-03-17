from rest_framework import serializers
from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'
        read_only_fields = ['user']

    def to_internal_value(self, data):
        # Convert empty string to None for decimal fields
        if 'hourly_rate' in data and data['hourly_rate'] == '':
            data = data.copy()
            data['hourly_rate'] = None
        return super().to_internal_value(data)