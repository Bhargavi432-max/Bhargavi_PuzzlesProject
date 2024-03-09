from django.urls import path
from . import views,password_validation,user_validation

urlpatterns = [
    path('register_user/', user_validation.register_user, name='register_user'),
    path('user_login/', user_validation.user_login, name='user_login'),


    path('change_password/', password_validation.change_password, name='change_password'),
    path('forgot_password/', password_validation.forgot_password, name='forgot_password'),
    path('reset_password/', password_validation.reset_password, name='reset_password'),
    path('check_otp/', password_validation.check_otp, name='check_otp'),
    path('verify_otp/', password_validation.verify_otp, name='verify_otp'),


    path('get_puzzle_details/', views.get_puzzle_details, name='get_puzzle_details'),
    path('add_faq/', views.add_faq, name='add_faq'),
    path('get_faq/', views.retrieve_faqs, name='get_faq'),
    path('get_ids/', views.get_all_full_ids, name='get_ids'),
    path('get_user_statistics/', views.get_user_statistics, name='get_user_statistics'),
    path('mark_puzzle_completed/', views.mark_puzzle_completed, name='mark_puzzle_completed'),
    path('get_subscription_details/', views.get_subscription_details, name='get_subscription_details'),
    path('get_puzzle_access/', views.get_puzzle_access, name='get_puzzle_access'),

]
