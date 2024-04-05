import re
import json
import random
from django.conf import settings
from django.http import JsonResponse
from django.core.mail import send_mail
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password
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

            # Email message content with OTP
            html_message = f"""
                <html>
                    <head>
                        <style>
                            body {{
                                font-family: 'Arial', sans-serif;
                                background-color: #f4f4f4;
                                color: #333;
                            }}
                            .container {{
                                max-width: 600px;
                                margin: 0 auto;
                                padding: 20px;
                                background-color: #fff;
                                border-radius: 5px;
                                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                            }}
                            .logo {{
                                max-width: 100px;
                                height: auto;
                                margin-bottom: 20px;
                            }}
                            .otp-message {{
                                font-size: 16px;
                                color: #333;
                                margin-bottom: 20px;
                            }}
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <p class="otp-message">Dear user, your OTP for account activation at T-Machine School of Python is: <strong>{otp}</strong></p>
                        </div>
                    </body>
                </html>
                """

            # Send email with OTP for account activation
            send_mail(
                'Account Activation OTP',
                'Plain text version of the message (not displayed in HTML-enabled clients)',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
                html_message=html_message,
            )
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