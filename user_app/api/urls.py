from django.urls import path, include
from .views import RegisterAPI, LoginAPI, UserProfileAPI, LogoutAPI
from rest_framework_simplejwt.views import TokenRefreshView

# from rest_framework_simplejwt.views import (
#     TokenObtainPairView,
#     TokenRefreshView,
# )

urlpatterns = [
  path('register/', RegisterAPI.as_view(), name='register'),
  path('login/', LoginAPI.as_view(), name='login'),
  path('logout/', LogoutAPI.as_view(), name='api-logout'),
  path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
  path('user-profile/', UserProfileAPI.as_view(), name='api-user-profile'),

  # path('', include('knox.urls')),
  # path('api/auth/logout', knox_views.LogoutView.as_view(), name='knox_logout')
  # path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
  # path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]