from django.urls import path
from . import views

urlpatterns = [
     path('register_user/', views.register_user, name='register'),
    path('user_login/', views.user_login, name='login'),
]
