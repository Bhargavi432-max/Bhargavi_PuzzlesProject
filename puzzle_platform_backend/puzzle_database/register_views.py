import re
import json
import random
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password
from puzzle_platform_backend.email_sender import send_email
from .models import CustomUser,PlanTable,Subscription,UserProfile

# This function handles the user registration.
@csrf_exempt
def register_user(request):
    if request.method == 'POST':
        try:
            # Load request body data
            data = json.loads(request.body)
            # Extract user details from request body
            username = data.get('username')
            password = data.get('password')
            email = data.get('email')
            mobile_number = data.get('mobile_number')

            # Check if all required fields are provided
            if not (username and email and password and mobile_number):
                return JsonResponse({'status': False, 'message': 'All fields are required'})

            # Check if username already exists
            if CustomUser.objects.filter(username=username).exists():
                return JsonResponse({'status': False, 'message': 'Username already exists'})
            # Check if email already exists
            if CustomUser.objects.filter(email=email).exists():
                return JsonResponse({'status': False, 'message': 'Email already exists'})
            # Check if mobile number format is valid
            if not re.match(r'^[6-9]\d{9}$', mobile_number):
                return JsonResponse({'status': False, 'message': 'Invalid mobile number format'})

            # Generate OTP for account activation
            otp = str(random.randint(100000, 999999))

            # Hash password for security
            hashed_password = make_password(password)
            # Create new user with provided details
            new_user = CustomUser.objects.create(
                username=username,
                email=email,
                password=hashed_password,
                mobile_number=mobile_number,
                otp=otp,
                is_active=False
            )

            # Send email with OTP for account activation
            send_email('Account Activation OTP','Account Activation',[email],username,otp)

            return JsonResponse({'status': True, 'message': 'User registered successfully. Please check your email for OTP.'})
        except json.JSONDecodeError:
            return JsonResponse({'status': False, 'message': 'Invalid JSON format in the request body'}, status=400)
        except Exception as e:
            return JsonResponse({'status': False, 'message': f'Error occurred while registering user: {str(e)}'}, status=500)

    else:
        # Handle non-POST requests
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