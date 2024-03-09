from django.contrib.auth.hashers import make_password,check_password
from django.contrib.auth import authenticate, login
from django.http import JsonResponse,HttpResponse
from django.views.decorators.csrf import csrf_exempt
from .models import CustomUser,Admin,Subscription,DataTable,UserDataTableStatus,FAQ,UserProfile
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


@csrf_exempt
def change_password(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        old_password = data.get('old_password')
        new_password = data.get('new_password')

        if not (email and old_password and new_password):
            return JsonResponse({'status': False,'message': 'All fields are required'})

        user = authenticate_user(email, old_password)
        if user is not None:
            hashed_new_password = make_password(new_password)
            user.password = hashed_new_password
            user.save()
            return JsonResponse({'status': True,'message': 'Password changed successfully'})
        else:
            return JsonResponse({'status': False,'message': 'Invalid email or password'})

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
            return JsonResponse({'status': False, 'message': 'User with this email does not exist'})

        otp = str(random.randint(100000, 999999))
        user.otp = otp
        user.save()

        subject = 'Password Reset OTP'
        message = f'Your OTP for password reset is: {otp}'  
        email_from = settings.DEFAULT_FROM_EMAIL
        recipient_list = [email]
        send_mail(subject, message, email_from, recipient_list)

        return JsonResponse({'status': True, 'message': 'OTP sent to your email. Please check your inbox.'})
    else:
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=400)


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
    
@csrf_exempt
def get_puzzle_details(request):
    if request.method == 'GET':
        data = json.loads(request.body)
        email = data.get('email')
        task_id = data.get('task_id')
        puzzle_id = data.get('puzzle_id')
        
        try:
            user = CustomUser.objects.get(email=email)
            subscription = Subscription.objects.get(user=user)
            plan_type = subscription.sub_plan_type
            task = DataTable.objects.filter(task_id=task_id).first()
            if task is None:
                return HttpResponse("Task not found")
            puzzle = DataTable.objects.filter(puzzle_no=puzzle_id, task_no=task_id).first()
            if puzzle is None:
                return HttpResponse("Puzzle not found")
            if plan_type == 'Free':
                if task_id == 1 and puzzle_id <= 5:
                    return HttpResponse("Accept")
                else:
                    return HttpResponse("Not Accept. Upgrade your plan.")
            elif plan_type == 'Basic':
                prev_puzzle_id = puzzle_id - 1
                prev_puzzle = DataTable.objects.filter(puzzle_no=prev_puzzle_id, task_no=task_id).first()
                if prev_puzzle is None:
                    return HttpResponse("Invalid puzzle_id")

                prev_puzzle_status = UserDataTableStatus.objects.get(user=user, data_table=prev_puzzle)
                if prev_puzzle_status.status != "completed":
                    return HttpResponse("Complete Previous Puzzles")

                return HttpResponse("Accept")
            elif plan_type == 'Premium':
                return HttpResponse("Accept")
        except CustomUser.DoesNotExist:
            return HttpResponse("User not found")
        except Subscription.DoesNotExist:
            return HttpResponse("Subscription not found")
        except DataTable.DoesNotExist:
            return HttpResponse("DataTable not found")
        except UserDataTableStatus.DoesNotExist:
            return HttpResponse("UserDataTableStatus not found")

    return HttpResponse('Hello')


@csrf_exempt
def contact_us(request):
    if request.method == 'POST':
        data = request.POST
        name = data.get('name')
        email = data.get('email')
        mobile_number = data.get('mobile_number')
        
        if not (name and email and mobile_number):
            return JsonResponse({'status': False, 'message': 'All fields are required'})
        
        return JsonResponse({'status': True, 'message': 'Contact form submitted successfully'})
    else:
        return JsonResponse({'status': False, 'message': 'Only POST requests are allowed'})

@csrf_exempt
def feedback(request):
    if request.method == 'POST':
        data = request.POST
        rating = data.get('rating')
        review = data.get('review')
        
        if not (rating and review):
            return JsonResponse({'status': False, 'message': 'All fields are required'})
        
        return JsonResponse({'status': True, 'message': 'Feedback form submitted successfully'})
    else:
        return JsonResponse({'status': False, 'message': 'Only POST requests are allowed'})
    

@csrf_exempt
def add_faq(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        question = data.get('question')
        answer = data.get('answer')

        if not (question and answer):
            return JsonResponse({'status': False, 'message': 'Both question and answer are required'})

        FAQ.objects.create(question=question, answer=answer)
        return JsonResponse({'status': True, 'message': 'FAQ added successfully'})
    else:
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=400)
    
def retrieve_faqs(request):
    faqs = FAQ.objects.all()
    faq_list = [{'question': faq.question, 'answer': faq.answer} for faq in faqs]

    return JsonResponse({'status': True, 'faqs': faq_list})

@csrf_exempt
def get_all_full_ids(request):
    print(request.method)
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            task_id = data.get('taskId')
            user = CustomUser.objects.get(email=email)
            status_objects = UserDataTableStatus.objects.filter(user=user)
            data_table_objects = DataTable.objects.filter(task_id=task_id)
            status_dict = {status.data_table_id: status.puzzle_status for status in status_objects}
            data_list = [
                {
                    'id': obj.id,
                    'task_no': obj.task_id,
                    'puzzle_no': obj.puzzle_id,
                    'puzzle_name': obj.puzzle_name,
                    # 'puzzle_video': obj.puzzle_video,
                    # 'puzzle_question': obj.puzzle_question,
                    'level': obj.level,
                    'puzzle_price': str(obj.puzzle_price),
                    'user_status': status_dict.get(obj.id),
                }
                for obj in data_table_objects
            ]
            print(data_list)
            return JsonResponse({'status': True, 'full_ids': data_list})
        except Exception as e:
            return JsonResponse({'status': False, 'message': 'Error fetching full_ids'})

    return JsonResponse({'status': False, 'message': 'Only GET requests are allowed'})


@csrf_exempt
def get_user_statistics(request):
    if request.method == 'GET':
        try:
            data = json.loads(request.body)
            user_email = data.get('email')
            user = CustomUser.objects.get(email=user_email)
            user_statistics = {
                'completed_puzzles': UserDataTableStatus.objects.filter(user=user, status='completed').count(),
                'incompleted_puzzles': UserDataTableStatus.objects.filter(user=user, status='incompleted').count(),
                'notstarted_puzzles': UserDataTableStatus.objects.filter(user=user, status='notstarted').count(),
            }
            return JsonResponse({'status': True, 'user_statistics': user_statistics})
        except CustomUser.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User not found'})
        except Subscription.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'Subscription not found'})
        except UserProfile.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'UserProfile not found'})
    else:
        return JsonResponse({'error': 'Only GET requests are allowed'}, status=400)
    
@csrf_exempt
def mark_puzzle_completed(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_email = data.get('email')
            task_id = data.get('task_id')
            puzzle_id = data.get('puzzle_id')
            user = CustomUser.objects.get(email=user_email)
            puzzle = DataTable.objects.get(task_id=task_id, puzzle_id=puzzle_id)
            status = UserDataTableStatus.objects.get(user=user, data_table=puzzle)
            
            if status.status == 'completed':
                return JsonResponse({'status': False, 'message': 'Puzzle already completed'})

            status.status = 'completed'
            status.save()

            return JsonResponse({'status': True, 'message': 'Puzzle marked as completed'})
        except CustomUser.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User not found'})
        except DataTable.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'Puzzle not found'})
        except UserDataTableStatus.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'UserDataTableStatus not found'})
    else:
        return JsonResponse({'error': 'Only POST requests are allowed'})
    
@csrf_exempt
def get_subscription_details(request):
    if request.method == 'POST':
        try:
            user_email = request.POST.get('email')
            user = CustomUser.objects.get(email=user_email)
            subscription_details = {
                'plan_type': Subscription.objects.get(user=user).sub_plan_type,
                'renewal_status': Subscription.objects.get(user=user).sub_renewal,
                'next_renewal_date': Subscription.objects.get(user=user).timestamp,
            }
            return JsonResponse({'status': True, 'subscription_details': subscription_details})
        except Subscription.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'Subscription not found'})
    else:
        return JsonResponse({'error': 'Only GET requests are allowed'})
    
@csrf_exempt
def get_puzzle_access(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_email = data.get('email')
            puzzle_id = data.get('puzzle_id')
            task_id = data.get('task_id')
            print(user_email, puzzle_id, task_id)
            user = CustomUser.objects.get(email=user_email)
            puzzle = DataTable.objects.get(puzzle_id=puzzle_id, task_id=task_id)
            subscription_type = Subscription.objects.get(user=user).sub_plan_type
            print(subscription_type)

            puzzle_data = {
                'video': puzzle.puzzle_video,
                'question': puzzle.puzzle_question,
                'status': 'User has access to the puzzle'
            }

            if subscription_type == 'Free':
                if task_id == 1 and int(puzzle_id[-2:]) <= 5:
                    print(puzzle_data)
                    return JsonResponse({'status': True, 'data': puzzle_data})
                else:
                    return JsonResponse({'status': False, 'message': 'User does not have access. Upgrade your plan.'})

            elif subscription_type == 'Basic':
                prev_puzzle_id = puzzle_id[:-2] + str(int(puzzle_id[-2]) - 1)
                prev_puzzle = DataTable.objects.filter(puzzle_id=prev_puzzle_id, task_id=task_id).first()

                if prev_puzzle is None:
                    return JsonResponse({'status': False, 'message': 'Invalid puzzle_id'})

                prev_puzzle_status = UserDataTableStatus.objects.get(user=user, data_table=prev_puzzle).status

                if prev_puzzle_status == 'completed':
                    print(puzzle_data)
                    return JsonResponse({'status': True, 'data': puzzle_data})
                else:
                    return JsonResponse({'status': False, 'message': 'Complete previous puzzles to access this puzzle.'})

            elif subscription_type == 'Premium':
                print(puzzle_data)
                return JsonResponse({'status': True, 'data': puzzle_data})

            else:
                return JsonResponse({'status': False, 'message': 'Invalid subscription type'})

        except CustomUser.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User not found'})
        except DataTable.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'Puzzle not found'})
        except UserDataTableStatus.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'UserDataTableStatus not found'})
        except Subscription.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'Subscription not found'})
    else:
        return JsonResponse({'error': 'Only POST requests are allowed'})




