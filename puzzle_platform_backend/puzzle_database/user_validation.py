from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import random
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
from django.conf import settings
from .models import CustomUser
from .authentication import authenticate_user,authenticate_admin
import re
from django.core import serializers


# This function handles the user registration.
@csrf_exempt
def register_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            email = data.get('email')
            mobile_number = data.get('mobile_number')

            if not (username and email and password and mobile_number):
                return JsonResponse({'status': False, 'message': 'All fields are required'})

            if CustomUser.objects.filter(username=username).exists():
                return JsonResponse({'status': False, 'message': 'Username already exists'})
            if CustomUser.objects.filter(email=email).exists():
                return JsonResponse({'status': False, 'message': 'Email already exists'})
            if not re.match(r'^[6-9]\d{9}$', mobile_number):
                return JsonResponse({'status': False, 'message': 'Invalid mobile number format'})

            otp = str(random.randint(100000, 999999))

            hashed_password = make_password(password)
            new_user = CustomUser.objects.create(
                username=username,
                email=email,
                password=hashed_password,
                mobile_number=mobile_number,
                otp=otp,
                is_active=False
            )
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
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=400)


# This function handles the user login.
@csrf_exempt
def user_login(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        user = authenticate_user(email, password)
        if user is not None:
            if user.is_active:
                if user.is_twostep_active:
                    return JsonResponse({'message': 'Need two step verification', 'login_status': user.login_status,'twostep': user.is_twostep_active})
                else:
                    user.login_status = True
                    user.save()
                    # login(request, user)
                    return JsonResponse({'message': 'User login successful', 'login_status': user.login_status,'twostep': user.is_twostep_active})
            else:
                return JsonResponse({'message': 'User account is not active', 'login_status': False})
        
        admin = authenticate_admin(email, password)
        if admin is not None:
            admin.login_status = True
            admin.save()
            return JsonResponse({'message': 'Admin login successful', 'login_status': admin.login_status})

        return JsonResponse({'message': 'Invalid username or password', 'login_status': False})
    else:
        return JsonResponse({'message': 'Only POST requests are allowed', 'login_status': False})


@csrf_exempt 
def get_user_info(request):
    print("enter")
    if request.method == 'POST':
        data = json.loads(request.body)
        print(data)
        email = data.get('email')
        image_url =  'puzzle_frontend/src/profile_image/'+'tmach.png'
        college_name = data.get('collegeName')
        education = data.get('education')
        print(image_url)

        if email is None:
            return JsonResponse({'success': False, 'error': 'Email is required'}, status=400)

        try:
            user = CustomUser.objects.get(email=email)
            user.profile_image = image_url
            user.college_name = college_name
            user.education = education
            user.save()
            return JsonResponse({'success': True, 'message': "stored successful"})
        except CustomUser.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'User not found'}, status=404)
    else:
        return JsonResponse({'success': False, 'error': 'Only POST requests are allowed'}, status=405)
    

@csrf_exempt 
def get_user_details(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        if email is None:
            return JsonResponse({'success': False, 'error': 'Email is required'}, status=400)

        try:
            user = CustomUser.objects.get(email=email)
            user_data = {
                'username': user.username,
                'email': user.email,
                'mobile_number': user.mobile_number,
                'profile_image': str(user.profile_image),
                'education': user.education,
                'college_name': user.college_name,
            }
            return JsonResponse({'success': True, 'user_data': user_data})
        except CustomUser.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'User not found'}, status=404)
    else:
        return JsonResponse({'success': False, 'error': 'Only POST requests are allowed'}, status=405)


@csrf_exempt
def get_twostep_status(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        if email is None:
            return JsonResponse({'success': False, 'error': 'Email is required'}, status=400)

        try:
            user = CustomUser.objects.get(email=email)
            return JsonResponse({'success': True, 'is_twostep_active': user.is_twostep_active})
        except CustomUser.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'User not found'}, status=404)
    else:
        return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)

@csrf_exempt
def update_twostep_status(request):
    if request.method == 'PUT':
        data = json.loads(request.body)
        email = data.get('email')
        is_twostep_active = data.get('is_twostep_active')
        if email is None:
            return JsonResponse({'success': False, 'error': 'Email is required'}, status=400)
        if is_twostep_active is None:
            return JsonResponse({'success': False, 'error': 'is_twostep_active is required'}, status=400)

        try:
            user = CustomUser.objects.get(email=email)
            user.is_twostep_active = is_twostep_active
            user.save()
            return JsonResponse({'success': True, 'message': "is_twostep_active updated successfully"})
        except CustomUser.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'User not found'}, status=404)
    else:
        return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)