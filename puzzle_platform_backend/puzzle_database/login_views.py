import json
import random
from .models import CustomUser
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from puzzle_platform_backend.email_sender import send_email
from .authentication import authenticate_user,authenticate_admin

# This function handles user login.
@csrf_exempt
def user_login(request):
    if request.method == 'POST':
        try:
            # Load request body as JSON data
            data = json.loads(request.body)
            # Extract email and password from JSON data
            email = data.get('email')
            password = data.get('password')
            
            # Authenticate user with provided credentials
            user = authenticate_user(email, password)
            if user is not None:
                if user.is_active:
                    if user.is_twostep_active:
                        # If two-step verification is active, return a message indicating it
                        return JsonResponse({'message': 'Need two-step verification', 'login_status': user.login_status, 'twostep': user.is_twostep_active})
                    else:
                        # Update user login status and return a successful login message
                        user.login_status = True
                        user.save()
                        return JsonResponse({'message': 'User login successful', 'login_status': user.login_status, 'twostep': user.is_twostep_active})
                else:
                    # If user account is not active, return a message indicating it
                    return JsonResponse({'message': 'User account is not active', 'login_status': False})
            
            # Authenticate admin with provided credentials
            admin = authenticate_admin(email, password)
            if admin is not None:
                # Update admin login status and return a successful login message
                admin.login_status = True
                admin.save()
                return JsonResponse({'message': 'Admin login successful', 'login_status': admin.login_status})

            # If authentication fails, return a message indicating invalid credentials
            return JsonResponse({'message': 'Invalid username or password', 'login_status': False})
        except json.JSONDecodeError:
            # If JSON decoding fails, return an error message
            return JsonResponse({'message': 'Invalid JSON format in the request body'}, status=400)
    else:
        # If request method is not POST, return a message indicating only POST requests are allowed
        return JsonResponse({'message': 'Only POST requests are allowed', 'login_status': False})


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
        print([email])
        print(send_email('2-step verification OTP','2-step verification',[email],user.username,otp))

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
