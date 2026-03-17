from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        is_auth = request.user.is_authenticated
        role = getattr(request.user, 'role', 'N/A')
        is_super = getattr(request.user, 'is_superuser', False)
        
        result = is_auth and (role == 'admin' or is_super)
        
        print(f"--- PERMISSION CHECK: User={request.user.username} | Auth={is_auth} | Role={role} | Super={is_super} | ALLOWED={result} ---")
        return result
