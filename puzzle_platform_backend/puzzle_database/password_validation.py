import json
import random
from .models import CustomUser
from django.conf import settings
from django.http import JsonResponse
from .authentication import authenticate_user
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password
from puzzle_platform_backend.email_sender import send_email


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

        # Send OTP to user's email for password reset
        send_email('Password Reset OTP','Password Reset',[email],user.username,otp)

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


