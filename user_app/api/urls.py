from django.urls import path, include
from .views import RegisterAPI, LoginAPI, UserAPI
# from rest_framework_simplejwt.views import (
#     TokenObtainPairView,
#     TokenRefreshView,
# )

urlpatterns = [
  path('', include('knox.urls')),
  path('register/', RegisterAPI.as_view()),
  path('login/', LoginAPI.as_view()),
  path('user/', UserAPI.as_view()),
  # path('api/auth/logout', knox_views.LogoutView.as_view(), name='knox_logout')
  # path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
  # path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]