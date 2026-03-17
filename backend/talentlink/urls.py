"""
URL configuration for talentlink project.
"""

from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import MyTokenObtainPairView

# simple home view
def home(request):
    return HttpResponse("TalentLink Backend is running 🚀")

urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),

    # JWT Auth
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Backend APIs for Milestone 2 & 3
    path('api/', include('projects.urls')),
    path('api/', include('proposals.urls')),
    path('api/', include('profiles.urls')),
    path('api/', include('users.urls')),
    path("api/", include("contracts.urls")),
    path('api/', include('notifications.urls')),
    path('api/', include('messaging.urls')),
    path('api/', include('reviews.urls')),
    path('api/dashboard/', include('dashboard.urls')),
]
