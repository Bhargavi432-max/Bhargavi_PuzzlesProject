from django.urls import path
from . import views

urlpatterns = [
     path('register_user/', views.register_user, name='register_user'),
    path('user_login/', views.user_login, name='user_login'),
    path('change_password/', views.change_password, name='change_password'),
]
