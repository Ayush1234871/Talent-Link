from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import UserVerificationViewSet, RegisterView

router = DefaultRouter()
router.register(r'verify-users', UserVerificationViewSet)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
] + router.urls