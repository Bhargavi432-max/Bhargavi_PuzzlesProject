from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import random
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
from django.conf import settings
from .models import CustomUser,PlanTable,Subscription,UserProfile
from .authentication import authenticate_user


# View for changing user password.
@csrf_exempt
def change_password(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        old_password = data.get('old_password')
        new_password = data.get('new_password')

        if not (email and old_password and new_password):
            return JsonResponse({'status': False,'message': 'All fields are required'})

        # Authenticate user
        user = authenticate_user(email, old_password)
        if user is not None:
            # Hash new password and update user's password
            hashed_new_password = make_password(new_password)
            user.password = hashed_new_password
            user.save()
            return JsonResponse({'status': True,'message': 'Password changed successfully'})
        else:
            return JsonResponse({'status': False,'message': 'Invalid email or password'})

    else:
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=400)

# View for handling forgot password functionality.
@csrf_exempt
def forgot_password(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User with this email does not exist'})

        # Generate OTP
        otp = str(random.randint(100000, 999999))
        user.otp = otp
        user.save()

        # Send OTP to user's email
        subject = 'Password Reset OTP'
        message = f'Your OTP for password reset is: {otp}'  
        email_from = settings.DEFAULT_FROM_EMAIL
        recipient_list = [email]
        send_mail(subject, message, email_from, recipient_list)

        return JsonResponse({'status': True, 'message': 'OTP sent to your email. Please check your inbox.'})
    else:
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=400)


# View for checking OTP during password reset.
@csrf_exempt
def check_otp(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        otp = data.get('otp')
        print(otp)

        try:
            user = CustomUser.objects.get(email=email)
            if user.otp == otp:
                return JsonResponse({'status': True, 'message': 'OTP is valid'})
            else:
                return JsonResponse({'status': False, 'message': 'Invalid OTP'})
        except CustomUser.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User with this email does not exist'})
    else:
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=400)

# View for resetting user password.
@csrf_exempt
def reset_password(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        new_password = data.get('new_password')
        confirm_password = data.get('confirm_password')

        if not (email and new_password and confirm_password):
            return JsonResponse({'status': False, 'message': 'All fields are required'})
        try:
            user = CustomUser.objects.get(email=email)
            if new_password != confirm_password:
                return JsonResponse({'status': False, 'message': 'Passwords do not match'})

            # Hash new password and update user's password
            hashed_new_password = make_password(new_password)
            user.password = hashed_new_password
            user.save()
            user.otp = None
            user.save()

            return JsonResponse({'status': True, 'message': 'Password reset successfully'})
        except CustomUser.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User with this email does not exist'})
    else:
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=400)

# View for verifying OTP during account activation.
@csrf_exempt
def verify_otp(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        otp = data.get('otp')
        try:
            user = CustomUser.objects.get(email=email)
            if user.otp == otp:
                user.is_active = True
                user.otp = None
                user.save() 

                # Create default subscription and user profile
                free_plan = PlanTable.objects.get(plan_type='FREE')
                Subscription.objects.create(user=user, plan_data=free_plan)
                UserProfile.objects.create(user=user,wallet=0)

                return JsonResponse({'status': True, 'message': 'Account activated successfully'})
            else:
                return JsonResponse({'status': False, 'message': 'Invalid OTP'})
        except CustomUser.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User not found'})
    else:
        return JsonResponse({'status': False, 'error': 'Only POST requests are allowed'}, status=400)

# View for sending OTP during account login for 2 step verification.
@csrf_exempt
def send_otp_via_email(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User with this email does not exist'})

        # Generate OTP and send it to user's email
        otp = str(random.randint(100000, 999999))
        user.otp = otp
        user.save()

        subject = '2-step verification OTP'
        message = f'Your OTP for 2-step verification is: {otp}'  
        email_from = settings.DEFAULT_FROM_EMAIL
        recipient_list = [email]
        send_mail(subject, message, email_from, recipient_list)

        return JsonResponse({'status': True, 'message': 'OTP sent to your email. Please check your inbox.'})
    else:
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=400)

# View for verifying OTP during account login for 2 step verification.
@csrf_exempt
def login_verify_otp(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        otp = data.get('otp')
        try:
            user = CustomUser.objects.get(email=email)
            if user.otp == otp:
                user.is_active = True
                user.otp = None
                user.save()
                return JsonResponse({'status': True, 'message': 'OTP verified successfully'})
            else:
                return JsonResponse({'status': False, 'message': 'Invalid OTP'})
        except CustomUser.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User not found'})
    else:
        return JsonResponse({'status': False, 'error': 'Only POST requests are allowed'}, status=400)
