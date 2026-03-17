import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'talentlink.settings')
django.setup()

from users.models import User
from profiles.models import Profile

print(f"Total Users: {User.objects.count()}")
for u in User.objects.all():
    profile_status = "Has Profile" if hasattr(u, 'profile') else "No Profile"
    print(f"ID: {u.id} | User: {u.username} | Role: {u.role} | Superuser: {u.is_superuser} | {profile_status}")

admins = User.objects.filter(role='admin')
print(f"Admins found: {admins.count()}")
