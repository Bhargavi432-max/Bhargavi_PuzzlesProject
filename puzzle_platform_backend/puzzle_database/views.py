
from django.http import JsonResponse,HttpResponse
from django.views.decorators.csrf import csrf_exempt
from .models import CustomUser,Subscription,DataTable,UserDataTableStatus,FAQ,UserProfile
import json
import os
from django.conf import settings

# This view function retrieves puzzle details based on user email, task ID, and puzzle ID.
# @csrf_exempt
# def get_puzzle_details(request):
#     if request.method == 'GET':
#         data = json.loads(request.body)
#         email = data.get('email')
#         task_id = data.get('task_id')
#         puzzle_id = data.get('puzzle_id')
        
#         try:
#             user = CustomUser.objects.get(email=email)
#             subscription = Subscription.objects.get(user=user)
#             plan_type = subscription.sub_plan_type
#             task = DataTable.objects.filter(task_id=task_id).first()
#             if task is None:
#                 return HttpResponse("Task not found")
#             puzzle = DataTable.objects.filter(puzzle_id=puzzle_id, task_id=task_id).first()
#             if puzzle is None:
#                 return HttpResponse("Puzzle not found")
#             if plan_type == 'Free':
#                 if task_id == 1 and puzzle_id <= 5:
#                     return HttpResponse("Accept")
#                 else:
#                     return HttpResponse("Not Accept. Upgrade your plan.")
#             elif plan_type == 'Basic':
#                 prev_puzzle_id = puzzle_id - 1
#                 prev_puzzle = DataTable.objects.filter(puzzle_id=prev_puzzle_id, task_id=task_id).first()
#                 if prev_puzzle is None:
#                     return HttpResponse("Invalid puzzle_id")

#                 prev_puzzle_status = UserDataTableStatus.objects.get(user=user, data_table=prev_puzzle)
#                 if prev_puzzle_status.status != "completed":
#                     return HttpResponse("Complete Previous Puzzles")

#                 return HttpResponse("Accept")
#             elif plan_type == 'Premium':
#                 return HttpResponse("Accept")
#         except CustomUser.DoesNotExist:
#             return HttpResponse("User not found")
#         except Subscription.DoesNotExist:
#             return HttpResponse("Subscription not found")
#         except DataTable.DoesNotExist:
#             return HttpResponse("DataTable not found")
#         except UserDataTableStatus.DoesNotExist:
#             return HttpResponse("UserDataTableStatus not found")

#     return HttpResponse('Hello')


# This function handles the contact form submission.
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


# This function handles the feedback submission form.
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


# This view function adds a new FAQ entry.
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
    
    
# This view function retrieves all FAQs.
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
            puzzle_locked_dict = {status.data_table_id: status.puzzle_locked for status in status_objects}
            data_list = [
                {
                    'id': obj.id,
                    'task_id': obj.task_id,
                    'puzzle_id': obj.puzzle_id,
                    'puzzle_name': obj.puzzle_name,
                    'level': obj.level,
                    'puzzle_price': str(obj.puzzle_price),
                    'user_status': status_dict.get(obj.id),
                    'task_status': status.task_status,
                    'puzzle_locked': puzzle_locked_dict.get(obj.id),
                }
                for obj, status in zip(data_table_objects, status_objects)
            ]
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
            task_puzzles_count = DataTable.objects.filter(task_id=task_id).count()
            print(task_puzzles_count)

            completed_puzzles_count = UserDataTableStatus.objects.filter(
                user=user, data_table__task_id=task_id, puzzle_status='completed'
            ).count()
            print(completed_puzzles_count)

            if completed_puzzles_count == task_puzzles_count:
                task_statuses = UserDataTableStatus.objects.filter(
                    user=user, data_table__task_id=task_id
                )
                for task_status in task_statuses:
                    task_status.task_status = 'completed'
                    task_status.save()
            else:
                task_statuses = UserDataTableStatus.objects.filter(
                    user=user, data_table__task_id=task_id
                ).exclude(puzzle_status='completed')
                for task_status in task_statuses:
                    task_status.task_status = 'incompleted'
                    task_status.save()

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
            print(user_email,task_id, puzzle_id)
            user = CustomUser.objects.get(email=user_email)
            print(user)
            puzzle = DataTable.objects.get(puzzle_id=puzzle_id, task_id=task_id)
            print(puzzle)
            subscription_type = Subscription.objects.get(user=user).sub_plan_type
            print(subscription_type)
            puzzle_locked = UserDataTableStatus.objects.get(user=user , data_table=puzzle).puzzle_locked
            print(puzzle_locked)
            wallet_balance = UserProfile.objects.get(user=user).wallet
            puzzle_price = puzzle.puzzle_price
            print(subscription_type)

            print('Hello')

            protocol = 'https://' if request.is_secure() else 'http://'
            domain = '127.0.0.1:8000'  # Change this to your actual domain
            video_url = f"{protocol}{domain}{puzzle.puzzle_video.url}"
            puzzle_data = {
                'video': video_url,
                'question': puzzle.puzzle_question,
                'status': 'User has access to the puzzle',
                'puzzle_locked': puzzle_locked,
            }
            print(puzzle_data)
            if subscription_type == 'FREE':
                print(task_id,puzzle_id[-2:])
                if (task_id == 1 and int(puzzle_id[-2:]) <= 5) or puzzle_locked:
                    return JsonResponse({'status': True, 'data': puzzle_data})
                else:
                    return JsonResponse({'status': False, 'message': 'User does not have access. Upgrade your plan.'})

            elif subscription_type == 'BASIC':
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

            elif subscription_type == 'PREMIUM':
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


@csrf_exempt
def get_task_status(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_email = data.get('email')
            user = CustomUser.objects.get(email=user_email)
            task_statuses = {}

            for task_id in range(1, 26):
                try:
                    status_objects = UserDataTableStatus.objects.filter(user=user, data_table__task_id=task_id)
                    if status_objects.exists():
                        status_object = status_objects.first()
                        task_statuses[task_id] = status_object.task_status
                    else:
                        task_statuses[task_id] = 'notstarted'
                except Exception as e:
                    task_statuses[task_id] = 'error'

            return JsonResponse({'status': True, 'task_status': task_statuses})
        except CustomUser.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User not found'})
        except Exception as e:
            return JsonResponse({'status': False, 'message': 'Error fetching task statuses'})

    return JsonResponse({'status': False, 'message': 'Only GET requests are allowed'})


from django.utils import timezone
from .models import LogReport

@csrf_exempt
def log_operation(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_email = data.get('email')
            task_no = data.get('task_no')
            puzzle_no = data.get('puzzle_no')
            question_view_status = data.get('question_view_status')
            video_view_status = data.get('video_view_status')
            puzzle_status = data.get('puzzle_status')
            task_status = data.get('task_status')
            price_spend = data.get('price_spend')
            start_time = data.get('start_time')
            end_time = data.get('end_time')

            # Fetch the user based on the provided email
            user = CustomUser.objects.get(email=user_email)

            # Create a LogReport object to store the operation log
            log_entry = LogReport.objects.create(
                user=user,
                task_no=task_no,
                puzzle_no=puzzle_no,
                question_view_status=question_view_status,
                video_view_status=video_view_status,
                puzzle_status=puzzle_status,
                task_status=task_status,
                price_spend=price_spend,
                start_time=start_time,
                end_time=end_time,
                timestamp=timezone.now()
            )

            return JsonResponse({'status': True, 'message': 'Operation logged successfully'})

        except CustomUser.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User not found'})
        except Exception as e:
            return JsonResponse({'status': False, 'message': str(e)})

    else:
        return JsonResponse({'status': False, 'message': 'Only POST requests are allowed'})
