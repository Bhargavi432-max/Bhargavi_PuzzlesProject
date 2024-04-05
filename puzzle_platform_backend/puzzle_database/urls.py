from django.urls import path
from . import views,password_validation,user_validation,read_json_data,logreports,user_help_pages,razor_pay,login_views,register_views,puzzle_page_views

urlpatterns = [

    # Login related URLs
    path('user_login/', login_views.user_login, name='user_login'),
    path('get_twostep_status/', login_views.get_twostep_status, name='get_twostep_status'),
    path('update_twostep_status/', login_views.update_twostep_status, name='update_twostep_status'),
    path('send_otp_via_email/', login_views.send_otp_via_email, name='send_otp_via_email'),
    path('login_verify_otp/', login_views.login_verify_otp, name='login_verify_otp'),

    # Register related URLs
    path('register_user/', register_views.register_user, name='register_user'),
    path('verify_otp/', register_views.verify_otp, name='verify_otp'),

    # Puzzle Page related URLs
    path('get_ids/', puzzle_page_views.get_all_full_ids, name='get_ids'),
    path('mark_puzzle_status/', puzzle_page_views.mark_puzzle_status, name='mark_puzzle_status'),
    path('get_puzzle_access/', puzzle_page_views.get_puzzle_access, name='get_puzzle_access'),
    path('get_task_status/', puzzle_page_views.get_task_status, name='get_task_statuses'),
    path('buy_puzzle/', puzzle_page_views.buy_puzzle, name='buy_puzzle'),
    path('check_puzzle_locked/', puzzle_page_views.check_puzzle_locked, name='check_puzzle_locked'),

     # User authentication related URLs
    path('get_user_info/', user_validation.get_user_info, name='get_user_info'),
    path('get_user_details/', user_validation.get_user_details, name='get_user_details'),
    path('get_twostep_status/', user_validation.get_twostep_status, name='get_twostep_status'),
    
     # Password management URLs
    path('change_password/', password_validation.change_password, name='change_password'),
    path('forgot_password/', password_validation.forgot_password, name='forgot_password'),
    path('reset_password/', password_validation.reset_password, name='reset_password'),
    path('check_otp/', password_validation.check_otp, name='check_otp'),


     # User help and support URLs
    path('add_faq/', user_help_pages.add_faq, name='add_faq'),
    path('get_faq/', user_help_pages.retrieve_faqs, name='get_faq'),
    path('add_feedback/', user_help_pages.add_feedback, name='add_feedback'),
    path('contact_us/', user_help_pages.contact_us, name='contact_us'),
    path('get_subscription_details/', user_help_pages.get_subscription_details, name='get_subscription_details'),
    path('get_all_plans/', user_help_pages.get_all_plans, name='get_all_plans'),

    # Puzzle data and statistics URLs
   
    path('get_user_statistics/', views.get_user_statistics, name='get_user_statistics'),
    path('get_user_taskwise_statistics/', views.get_user_taskwise_statistics, name='get_user_taskwise_statistics'),
    path('link_subscription_user/', views.link_subscription_user, name='link_subscription_user'),

    # Json File Reading URLs
    path('read_json_file_view/', read_json_data.read_json_file_view, name='read_json_file_view'),

    # Log Report URLs
    path('log_login_register_otp/', logreports.log_login_register_otp, name='log_login_register_otp'),
    path('log_task_click/', logreports.log_task_click, name='log_task_click'),
    path('log_puzzle_click/', logreports.log_puzzle_click, name='log_puzzle_click'),
    path('log_wallet_spend/', logreports.log_wallet_spend, name='log_wallet_spend'),

    # Payment Handle URLs
    path('order_create/', razor_pay.order_create, name='order_create'),
    path('paymenthandler/<str:email>/<str:amount>/', razor_pay.paymenthandler, name='paymenthandler'),
    path('get_payment_history/', razor_pay.get_payment_history, name='get_payment_history')

]
