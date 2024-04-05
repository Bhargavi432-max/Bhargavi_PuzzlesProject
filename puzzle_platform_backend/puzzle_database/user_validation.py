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
import os
from django.core import serializers


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

    

# This function retrieves user information and updates it if necessary.
@csrf_exempt 
def get_user_info(request):
    if request.method == 'POST':
        # Retrieve data from the request
        username = request.POST.get('username')
        email = request.POST.get('email')
        education = request.POST.get('education')
        college_name = request.POST.get('collegeName')
        imageFile = request.FILES.get('imageFile')
        
        # Check if email is provided
        if email is None:
            return JsonResponse({'success': False, 'error': 'Email is required'}, status=400)

        try:
            # Find the user by email
            user = CustomUser.objects.get(email=email)
            if imageFile:
                # Generate a unique file name and save the image
                file_name = str(user.user_id) + '_' + imageFile.name
                save_path = os.path.join( 'puzzle_frontend/src/profile_image/', file_name)
                with open(save_path, 'wb+') as destination:
                    for chunk in imageFile.chunks():
                        destination.write(chunk)
                user.profile_image = os.path.join('puzzle_frontend/src/profile_image/', file_name)
            # Update user information
            user.college_name = college_name
            user.education = education
            user.save()
            return JsonResponse({'success': True, 'message': "User information stored successfully"})
        except CustomUser.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'User not found'}, status=404)
    else:
        return JsonResponse({'success': False, 'error': 'Only POST requests are allowed'}, status=405)

@csrf_exempt 
def get_user_details(request):
    if request.method == 'POST':
        try:
            # Load request body as JSON data
            data = json.loads(request.body)
            # Extract email from JSON data
            email = data.get('email')
            # Check if email is provided
            if email is None:
                return JsonResponse({'success': False, 'error': 'Email is required'}, status=400)

            try:
                # Retrieve user details using email
                user = CustomUser.objects.get(email=email)
                # Construct user data dictionary
                user_data = {
                    'username': user.username,
                    'email': user.email,
                    'mobile_number': user.mobile_number,
                    'profile_image': str(user.profile_image),
                    'education': user.education,
                    'college_name': user.college_name,
                }
                # Return user data as JSON response
                return JsonResponse({'success': True, 'user_data': user_data})
            except CustomUser.DoesNotExist:
                # If user is not found, return an error message
                return JsonResponse({'success': False, 'error': 'User not found'}, status=404)
        except json.JSONDecodeError:
            # If JSON decoding fails, return an error message
            return JsonResponse({'success': False, 'error': 'Invalid JSON format in the request body'}, status=400)
    else:
        # If request method is not POST, return a message indicating only POST requests are allowed
        return JsonResponse({'success': False, 'error': 'Only POST requests are allowed'}, status=405)

@csrf_exempt
def get_twostep_status(request):
    if request.method == 'POST':
        try:
            # Load request body as JSON data
            data = json.loads(request.body)
            # Extract email from JSON data
            email = data.get('email')
            # Check if email is provided
            if email is None:
                return JsonResponse({'success': False, 'error': 'Email is required'}, status=400)

            try:
                # Retrieve user based on provided email
                user = CustomUser.objects.get(email=email)
                # Return whether two-step verification is active for the user
                return JsonResponse({'success': True, 'is_twostep_active': user.is_twostep_active})
            except CustomUser.DoesNotExist:
                # If user is not found, return an error message
                return JsonResponse({'success': False, 'error': 'User not found'}, status=404)
        except json.JSONDecodeError:
            # If JSON decoding fails, return an error message
            return JsonResponse({'success': False, 'error': 'Invalid JSON format in the request body'}, status=400)
    else:
        # If request method is not POST, return a message indicating only POST requests are allowed
        return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)

@csrf_exempt
def update_twostep_status(request):
    if request.method == 'POST':
        try:
            # Load request body as JSON data
            data = json.loads(request.body)
            # Extract email and is_twostep_active from JSON data
            email = data.get('email')
            is_twostep_active = data.get('is_twostep_active')
            # Check if email and is_twostep_active are provided
            if email is None:
                return JsonResponse({'success': False, 'error': 'Email is required'}, status=400)
            if is_twostep_active is None:
                return JsonResponse({'success': False, 'error': 'is_twostep_active is required'}, status=400)

            try:
                # Retrieve user based on provided email
                user = CustomUser.objects.get(email=email)
                # Update the user's two-step verification status
                user.is_twostep_active = is_twostep_active
                user.save()
                # Return success message
                return JsonResponse({'success': True, 'message': "is_twostep_active updated successfully"})
            except CustomUser.DoesNotExist:
                # If user is not found, return an error message
                return JsonResponse({'success': False, 'error': 'User not found'}, status=404)
        except json.JSONDecodeError:
            # If JSON decoding fails, return an error message
            return JsonResponse({'success': False, 'error': 'Invalid JSON format in the request body'}, status=400)
    else:
        # If request method is not POST, return a message indicating only POST requests are allowed
        return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)
