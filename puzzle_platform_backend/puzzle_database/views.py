from django.contrib.auth import authenticate, login
from django.contrib.auth.hashers import make_password,check_password
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import CustomUser,Admin
import json
import random
from django.core.mail import send_mail
from django.conf import settings



@csrf_exempt
def register_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        mobile_number = data.get('mobile_number')
        
        if not (username and email and password and mobile_number):
            return JsonResponse({'message': 'All fields are required'})
        
        if CustomUser.objects.filter(username=username).exists():
            return JsonResponse({'message': 'Username already exists'})
        if CustomUser.objects.filter(email=email).exists():
            return JsonResponse({'message': 'Email already exists'})

        otp = str(random.randint(100000, 999999))
        print(otp)
        
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

            return JsonResponse({'message': 'User registered successfully. Please check your email for OTP.'})
        except Exception as e:
            return JsonResponse({'message': 'Error occurred while registering user'})

    else:
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=400)


@csrf_exempt
def user_login(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        print(email,password)
        user = authenticate_user(email, password)
        if user is not None:
            if user.is_active:
                user.login_status = True
                user.save()
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


@csrf_exempt
def change_password(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        old_password = data.get('old_password')
        new_password = data.get('new_password')

        if not (email and old_password and new_password):
            return JsonResponse({'message': 'All fields are required'})

        user = authenticate_user(email, old_password)
        if user is not None:
            hashed_new_password = make_password(new_password)
            user.password = hashed_new_password
            user.save()
            return JsonResponse({'message': 'Password changed successfully'})
        else:
            return JsonResponse({'message': 'Invalid email or password'})

    else:
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=400)

@csrf_exempt
def forgot_password(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return JsonResponse({'message': 'User with this email does not exist'})

        # Generate OTP
        otp = str(random.randint(100000, 999999))

        # Save the OTP to the user instance
        user.otp = otp
        user.save()

        # Send email with OTP
        subject = 'Password Reset OTP'
        message = f'Your OTP for password reset is: {otp}'
        email_from = settings.DEFAULT_FROM_EMAIL
        recipient_list = [email]
        send_mail(subject, message, email_from, recipient_list)

        return JsonResponse({'message': 'OTP sent to your email. Please check your inbox.'})
    else:
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=400)


@csrf_exempt
def check_otp(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        otp = data.get('otp')

        try:
            user = CustomUser.objects.get(email=email)
            if user.otp == otp:
                return JsonResponse({'message': 'OTP is valid'})
            else:
                return JsonResponse({'message': 'Invalid OTP'})
        except CustomUser.DoesNotExist:
            return JsonResponse({'message': 'User with this email does not exist'})
    else:
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=400)


@csrf_exempt
def reset_password(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        new_password = data.get('new_password')
        confirm_password = data.get('confirm_password')

        if not (email and new_password and confirm_password):
            return JsonResponse({'message': 'All fields are required'})

        try:
            user = CustomUser.objects.get(email=email)
            if new_password != confirm_password:
                return JsonResponse({'message': 'Passwords do not match'})

            # Change the password
            user.set_password(new_password)
            user.save()

            # Clear the OTP
            user.otp = None
            user.save()

            return JsonResponse({'message': 'Password reset successfully'})
        except CustomUser.DoesNotExist:
            return JsonResponse({'message': 'User with this email does not exist'})
    else:
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=400)


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
                return JsonResponse({'status': True, 'message': 'Account activated successfully'})
            else:
                return JsonResponse({'status': False, 'message': 'Invalid OTP'})
        except CustomUser.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User not found'})
    else:
        return JsonResponse({'status': False, 'error': 'Only POST requests are allowed'}, status=400)



def authenticate_admin(email, password):
    try:
        admin = Admin.objects.get(admin_email=email)
        if admin.admin_password == password:
            return admin
        else:
            return None
    except Admin.DoesNotExist:
        return None

def authenticate_user(email, password):
    try:
        user = CustomUser.objects.get(email=email)
        if check_password(password, user.password):
            return user
        else:
            return None
    except CustomUser.DoesNotExist:
        return None
