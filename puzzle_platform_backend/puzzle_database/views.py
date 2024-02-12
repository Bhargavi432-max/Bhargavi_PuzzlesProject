from django.contrib.auth import authenticate, login
from django.contrib.auth.hashers import make_password,check_password
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import CustomUser,Admin
import json
from django.core.exceptions import ObjectDoesNotExist

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
        else:
            try:
                hashed_password = make_password(password)
                new_user = CustomUser.objects.create(username=username, email=email, password=hashed_password, mobile_number=mobile_number)
                return JsonResponse({'message': 'User registered successfully'})
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
            user.login_status = True
            user.save()
            return JsonResponse({'message': 'User login successful','login_status':user.login_status})
        
        admin = authenticate_admin(email, password)
        if admin is not None:
            admin.login_status = True
            admin.save()
            return JsonResponse({'message': 'Admin login successful','login_status':user.login_status})

        return JsonResponse({'message': 'Invalid username or password','login_status':False})
    else:
        return JsonResponse({'message': 'Only POST requests are allowed','login_status':False})



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
