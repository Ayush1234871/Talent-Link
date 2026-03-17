from django.urls import path
from .views import ClientDashboardView, FreelancerDashboardView, AdminDashboardView

urlpatterns = [
    path('client/', ClientDashboardView.as_view(), name='client-dashboard'),
    path('freelancer/', FreelancerDashboardView.as_view(), name='freelancer-dashboard'),
    path('admin/stats/', AdminDashboardView.as_view(), name='admin-dashboard-stats'),
]
