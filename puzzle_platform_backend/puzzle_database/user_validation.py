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


# View for getting 2 step verification.
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

# View for updating 2 step verification.
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