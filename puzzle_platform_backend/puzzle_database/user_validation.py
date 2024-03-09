from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import random
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
from django.conf import settings
from .models import CustomUser
from .authentication import authenticate_user,authenticate_admin


@csrf_exempt
def register_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        mobile_number = data.get('mobile_number')
        
        if not (username and email and password and mobile_number):
            return JsonResponse({'status': False,'message': 'All fields are required'})
        
        if CustomUser.objects.filter(username=username).exists():
            return JsonResponse({'status': False,'message': 'Username already exists'})
        if CustomUser.objects.filter(email=email).exists():
            return JsonResponse({'status': False,'message': 'Email already exists'})

        otp = str(random.randint(100000, 999999))
        
        try:
            hashed_password = make_password(password)
            new_user = CustomUser.objects.create(
                username=username, 
                email=email, 
                password=hashed_password, 
                mobile_number=mobile_number,
                otp=otp, 
                is_active=False
            )
            
            send_mail(
                'Account Activation OTP',
                f'Your OTP for account activation is: {otp}',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )

            return JsonResponse({'status': True,'message': 'User registered successfully. Please check your email for OTP.'})
        except Exception as e:
            return JsonResponse({'status': False,'message': 'Error occurred while registering user'})

    else:
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=400)


@csrf_exempt
def user_login(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        user = authenticate_user(email, password)
        if user is not None:
            if user.is_active:
                user.login_status = True
                user.save()
                # login(request, user)
                return JsonResponse({'message': 'User login successful', 'login_status': user.login_status})
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
