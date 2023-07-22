from rest_framework import permissions


class IsDriver(permissions.BasePermission):
    """
    Check if the user is a driver
    """

    def has_permission(self, request, view):
          if request.user.role == "driver":
              return True
          else:
              self.message = "User must be a driver to have a vehicle."
              return False

# class IsDriverOrReadOnly(permissions.BasePermission):

#     def has_permission(self, request, view):
#       if request.method in permissions.SAFE_METHODS:
#         return True
#       else:
#         return request.user.role == "driver"


class IsVerified(permissions.BasePermission):
    """
    Check user's verified status
    """

    def has_permission(self, request, view):
        return request.user.verified
