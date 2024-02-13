from django.urls import path
from . import views

urlpatterns = [
    path('register_user/', views.register_user, name='register_user'),
    path('user_login/', views.user_login, name='user_login'),
    path('change_password/', views.change_password, name='change_password'),
    path('forgot_password/', views.forgot_password, name='forgot_password'),
    path('reset_password/', views.reset_password, name='reset_password'),
     path('api/check_otp/', views.check_otp, name='check_otp'),
    path('verify_otp/', views.verify_otp, name='verify_otp'),
]
