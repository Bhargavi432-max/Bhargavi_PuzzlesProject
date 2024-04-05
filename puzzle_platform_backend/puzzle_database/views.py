from django.http import JsonResponse,HttpResponse
from django.views.decorators.csrf import csrf_exempt
from .models import CustomUser,Subscription,DataTable,UserDataTableStatus,UserProfile,PlanTable,LogReport
import json
from datetime import timedelta
from django.db.models import Count
from datetime import date
from django.db.models.functions import TruncDate

# View for retrieving all data of puzzle of the task along with their statuses.
# View for retrieving all data of puzzles for a specific task along with their statuses.
@csrf_exempt
def get_all_full_ids(request):
    if request.method == 'POST':
        try:
            # Load request body as JSON data
            data = json.loads(request.body)
            # Extract email and task ID from JSON data
            email = data.get('email')
            task_id = data.get('taskId')
            # Retrieve user based on provided email
            user = CustomUser.objects.get(email=email)
            # Retrieve status objects for the user
            status_objects = UserDataTableStatus.objects.filter(user=user)
            # Retrieve data table objects for the specified task
            data_table_objects = DataTable.objects.filter(task_id=task_id)
            # Create dictionaries for puzzle status and puzzle locked status
            status_dict = {status.data_table_id: status.puzzle_status for status in status_objects}
            puzzle_locked_dict = {status.data_table_id: status.puzzle_locked for status in status_objects}
            # Create a list containing data for each puzzle
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
                    'puzzle_count': status.puzzle_count, 
                    'video_count': status.video_count,
                }
                for obj, status in zip(data_table_objects, status_objects)
            ]
            # Retrieve the current puzzle ID for the user
            current_puzzle_id = UserProfile.objects.get(user=user).user_in_puzzle
            print(current_puzzle_id)
            return JsonResponse({'status': True, 'full_ids': data_list,'current_puzzle_id':current_puzzle_id})
        except Exception as e:
            return JsonResponse({'status': False, 'message': 'Error fetching full_ids'})

    return JsonResponse({'status': False, 'message': 'Only GET requests are allowed'})


# View for retrieving user puzzle statistics.
@csrf_exempt
def get_user_statistics(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_email = data.get('email')

            user = CustomUser.objects.get(email=user_email)
            user_data_statuses = UserDataTableStatus.objects.filter(user=user)

            # Calculate total time spent on puzzles
            total_time_spent_seconds = sum(status.time_spent for status in user_data_statuses)

            # Convert total time spent to hours, minutes, and seconds
            total_time_spent = timedelta(seconds=total_time_spent_seconds)
            total_hours = total_time_spent.seconds // 3600
            total_minutes = (total_time_spent.seconds % 3600) // 60
            total_seconds = total_time_spent.seconds % 60

            # Initialize dictionaries to store completed puzzles by level and total puzzles by level
            completed_puzzles_by_level = {'EASY': 0, 'MEDIUM': 0, 'HARD': 0}
            total_puzzles_by_level = {
                'EASY': DataTable.objects.filter(level='EASY').count(),
                'MEDIUM': DataTable.objects.filter(level='MEDIUM').count(),
                'HARD': DataTable.objects.filter(level='HARD').count()
            }

            # Count completed puzzles by level
            for status in user_data_statuses:
                if status.puzzle_status == 'completed':
                    level = status.data_table.level
                    completed_puzzles_by_level[level] += 1

            # Calculate percentage of completed puzzles for each level
            percentage_completed_by_level = {level: (completed_puzzles_by_level[level] / total_puzzles_by_level[level]) * 100 if total_puzzles_by_level[level] > 0 else 0 for level in completed_puzzles_by_level}

            # Initialize dictionary to store completed puzzles in each task
            completed_in_tasks = {}
            for each_task_id in range(1, 26):
                total_puzzles_count = DataTable.objects.filter(task_id=each_task_id).count()
                completed_puzzles_count = UserDataTableStatus.objects.filter(
                    user=user,
                    data_table__task_id=each_task_id,
                    puzzle_status='completed'
                ).count()
                completed_in_tasks[each_task_id] = {
                    'total_puzzles': total_puzzles_count,
                    'completed_puzzles': completed_puzzles_count
                }

            # Count total puzzles
            total_puzzles_count = UserDataTableStatus.objects.filter(user=user).count()

            # Calculate percentages for completed, incompleted, and not started puzzles
            completed_percentage = (UserDataTableStatus.objects.filter(user=user, puzzle_status='completed').count() / total_puzzles_count) * 100
            incompleted_percentage = (UserDataTableStatus.objects.filter(user=user, puzzle_status='incompleted').count()  / total_puzzles_count) * 100
            notstarted_percentage = (UserDataTableStatus.objects.filter(user=user, puzzle_status='notstarted').count()  / total_puzzles_count) * 100

            # Prepare user statistics data
            user_statistics = {
                'completed_puzzles': completed_percentage,
                'incompleted_puzzles': incompleted_percentage,
                'notstarted_puzzles': notstarted_percentage,
                'total_time_spent': {'hours': total_hours, 'minutes': total_minutes, 'seconds': total_seconds},
                'percentage_completed_by_level': percentage_completed_by_level,
                'completed_each_task': completed_in_tasks,
                'username': user.username,
                'college_name': user.college_name,
                'education': user.education,
            }

            return JsonResponse({'status': True, 'user_statistics': user_statistics})
        except CustomUser.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User not found'})
        except UserDataTableStatus.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'UserDataTableStatus not found'})
    else:
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=405)

# View for retrieving user puzzle statistics task-wise.
@csrf_exempt
def get_user_taskwise_statistics(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_email = data.get('email')
            task_id = data.get('task_id')

            user = CustomUser.objects.get(email=user_email)

            # Calculate time taken for completed puzzles by level
            easy_time_taken = sum(status.time_spent for status in UserDataTableStatus.objects.filter(user=user, data_table__task_id=task_id, puzzle_status='completed', data_table__level='EASY'))
            medium_time_taken = sum(status.time_spent for status in UserDataTableStatus.objects.filter(user=user, data_table__task_id=task_id, puzzle_status='completed', data_table__level='MEDIUM'))
            hard_time_taken = sum(status.time_spent for status in UserDataTableStatus.objects.filter(user=user, data_table__task_id=task_id, puzzle_status='completed', data_table__level='HARD'))

            # Convert time taken to timedelta objects
            easy_time_taken = timedelta(seconds=easy_time_taken)
            medium_time_taken = timedelta(seconds=medium_time_taken)
            hard_time_taken = timedelta(seconds=hard_time_taken)

            # Convert timedelta objects to hours, minutes, and seconds
            easy_hours, easy_minutes, easy_seconds = easy_time_taken.seconds // 3600, (easy_time_taken.seconds % 3600) // 60, easy_time_taken.seconds % 60
            medium_hours, medium_minutes, medium_seconds = medium_time_taken.seconds // 3600, (medium_time_taken.seconds % 3600) // 60, medium_time_taken.seconds % 60
            hard_hours, hard_minutes, hard_seconds = hard_time_taken.seconds // 3600, (hard_time_taken.seconds % 3600) // 60, hard_time_taken.seconds % 60

            # Fetch completed puzzles count by date
            completed_puzzles_by_date = LogReport.objects.filter(user=user, task_id=task_id, puzzle_status='completed').annotate(completed_date=TruncDate('timestamp')).values('completed_date').annotate(count=Count('id'))
            # Convert queryset to dictionary
            completed_puzzles_by_date_dict = {entry['completed_date'].strftime('%d-%B-%Y'): entry['count'] for entry in completed_puzzles_by_date}

            # Count completed puzzles by level
            completed_puzzles_by_level = {
                'EASY': UserDataTableStatus.objects.filter(user=user, data_table__task_id=task_id, puzzle_status='completed', data_table__level='EASY').count(),
                'MEDIUM': UserDataTableStatus.objects.filter(user=user, data_table__task_id=task_id, puzzle_status='completed', data_table__level='MEDIUM').count(),
                'HARD': UserDataTableStatus.objects.filter(user=user, data_table__task_id=task_id, puzzle_status='completed', data_table__level='HARD').count(),
            }

            # Prepare task statistics data
            task_statistics  = {
                'completed_puzzles': UserDataTableStatus.objects.filter(user=user, data_table__task_id=task_id, puzzle_status='completed').count(),
                'incompleted_puzzles': UserDataTableStatus.objects.filter(user=user, data_table__task_id=task_id, puzzle_status='incompleted').count(),
                'notstarted_puzzles': UserDataTableStatus.objects.filter(user=user, data_table__task_id=task_id, puzzle_status='notstarted').count(),
                'completed_puzzles_by_level': completed_puzzles_by_level,
                'time_taken': {
                    'EASY': {'hours': easy_hours, 'minutes': easy_minutes, 'seconds': easy_seconds},
                    'MEDIUM': {'hours': medium_hours, 'minutes': medium_minutes, 'seconds': medium_seconds},
                    'HARD': {'hours': hard_hours, 'minutes': hard_minutes, 'seconds': hard_seconds}
                },
                "completed_puzzles_by_date":completed_puzzles_by_date_dict,
            }

            return JsonResponse({'status': True, 'user_statistics': task_statistics})
        except CustomUser.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User not found'})
        except UserDataTableStatus.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'UserData TableStatus not found'})
    else:
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=405)

# View for marking puzzle status.
@csrf_exempt
def mark_puzzle_status(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_email = data.get('email')
            task_id = data.get('task_id')
            puzzle_id = data.get('puzzle_id')
            puzzle_count = data.get('puzzle_count')
            video_count = data.get('video_count')
            puzzle_status = data.get('puzzle_status').lower()            
            time_spent = data.get('time_spent')

            # Retrieving user and puzzle information
            user = CustomUser.objects.get(email=user_email)
            puzzle = DataTable.objects.get(task_id=task_id, puzzle_id=puzzle_id)
            status = UserDataTableStatus.objects.get(user=user, data_table=puzzle)
            user_subscription_type = Subscription.objects.get(user=user).plan_data.plan_type

            # Updating puzzle status counts and saving changes
            status.puzzle_count += puzzle_count
            status.video_count += video_count
            status.save()

            # Calculating time spent on the puzzle
            hours, minutes, seconds_with_milliseconds = time_spent.split(":")
            seconds, milliseconds = seconds_with_milliseconds.split(".")
            hours = int(hours)
            minutes = int(minutes)
            seconds = int(seconds)
            total_seconds = (hours * 3600) + (minutes * 60) + int(seconds)
            status.puzzle_status = puzzle_status
            status.time_spent = total_seconds
            status.save()

            # Unlocking next puzzle for BASIC subscription users
            if user_subscription_type == 'BASIC':
                next_puzzle_id = DataTable.objects.filter(puzzle_id__gt=puzzle_id, task_id=task_id).order_by('puzzle_id').first()
                if next_puzzle_id:
                    next_status = UserDataTableStatus.objects.get(user=user, data_table=next_puzzle_id)
                    next_status.puzzle_locked = False
                    next_status.save()

            # Updating task status if all puzzles in the task are completed or at least one is incomplete
            task_puzzles_count = DataTable.objects.filter(task_id=task_id).count()
            completed_puzzles_count = UserDataTableStatus.objects.filter(user=user, data_table__task_id=task_id, puzzle_status='completed').count()
            incompleted_puzzles_count = UserDataTableStatus.objects.filter(user=user, data_table__task_id=task_id, puzzle_status='incompleted').count()

            if completed_puzzles_count == task_puzzles_count:
                task_statuses = UserDataTableStatus.objects.filter(user=user, data_table__task_id=task_id)
                for task_status in task_statuses:
                    task_status.task_status = 'completed'
                    task_status.save()
            elif incompleted_puzzles_count > 0:
                task_statuses = UserDataTableStatus.objects.filter(user=user, data_table__task_id=task_id)
                for task_status in task_statuses:
                    task_status.task_status = 'incompleted'
                    task_status.save()

            return JsonResponse({'status': True, 'message': 'Puzzle and Task status are updated'})

        except CustomUser.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User not found'})
        except DataTable.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'Puzzle not found'})
        except UserDataTableStatus.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'UserDataTableStatus not found'})
    else:
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=405)
# View for retrieving puzzle access details.
@csrf_exempt
def get_puzzle_access(request):
    if request.method == 'POST':
        try:
            # Load request data
            data = json.loads(request.body)
            user_email = data.get('email')
            puzzle_id = data.get('puzzle_id')
            task_id = data.get('task_id')

            # Get user
            user = CustomUser.objects.get(email=user_email)
            
            # Get puzzle details
            puzzle = DataTable.objects.get(puzzle_id=puzzle_id, task_id=task_id)
            
            # Get puzzle lock status
            puzzle_locked = UserDataTableStatus.objects.get(user=user, data_table=puzzle).puzzle_locked
            
            # Extract relative path for the puzzle video
            start_index = puzzle.puzzle_video.path.find('videos')
            relative_path = puzzle.puzzle_video.path[start_index:].replace('\\', '/')

            # Update user state
            current_state = UserProfile.objects.get(user=user)
            current_state.user_in_task = task_id
            current_state.user_in_puzzle = puzzle_id
            current_state.save()

            # Construct puzzle data
            puzzle_data = {
                'video': relative_path,
                'question': puzzle.puzzle_question,
                'code': puzzle.puzzle_code,
                'puzzle_locked': puzzle_locked,
                'interview_code': puzzle.puzzle_interview_code,
                'puzzle_name': puzzle.puzzle_name,
                'status': 'User has access to the puzzle',
            }
            
            # Check if the puzzle is locked
            if not puzzle_locked:
                return JsonResponse({'status': True, 'data': puzzle_data})
            else:
                return JsonResponse({'status': False, 'message': 'User does not have access to puzzle. Upgrade your plan.'})

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


# View for retrieving task statuses for a user.
@csrf_exempt
def get_task_status(request):
    if request.method == 'POST':
        try:
            # Load request data
            data = json.loads(request.body)
            user_email = data.get('email')
            
            # Get user
            user = CustomUser.objects.get(email=user_email)
            
            # Dictionary to store task statuses
            task_statuses = {}

            # Loop through task IDs
            for task_id in range(1, 26):
                try:
                    # Get status objects for the user and task
                    status_objects = UserDataTableStatus.objects.filter(user=user, data_table__task_id=task_id)
                    
                    # Check if status objects exist
                    if status_objects.exists():
                        status_object = status_objects.first()
                        task_statuses[task_id] = status_object.task_status
                    else:
                        # If no status objects exist, set task status as 'notstarted'
                        task_statuses[task_id] = 'notstarted'
                except Exception as e:
                    # If an error occurs, set task status as 'error'
                    task_statuses[task_id] = 'error'

            # Return task statuses
            return JsonResponse({'status': True, 'task_status': task_statuses})
        
        except CustomUser.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User not found'})
        
        except Exception as e:
            return JsonResponse({'status': False, 'message': 'Error fetching task statuses'})

    # Return error response for non-POST requests
    return JsonResponse({'status': False, 'message': 'Only POST requests are allowed'})



# View for linking user with its subscription and updating puzzle status accordingly.
@csrf_exempt
def link_subscription_user(request):
    if request.method == 'POST':
        try:
            # Load request data
            data = json.loads(request.body)
            user_email = data.get('email')
            user_subscription_type = data.get('user_subscription_type')

            # Get all puzzles
            puzzles = DataTable.objects.all()

            # Get user
            user = CustomUser.objects.get(email=user_email)

            # Loop through each puzzle to create UserDataTableStatus instances for the user
            for puzzle in puzzles:
                # Check if the user has already played this puzzle
                existing_status = UserDataTableStatus.objects.filter(user=user, data_table=puzzle).exists()
                if not existing_status:
                    # Create UserDataTableStatus instance with puzzle_status and task_status as 'notstarted'
                    UserDataTableStatus.objects.create(
                        user=user,
                        data_table=puzzle,
                        puzzle_status='notstarted',
                        task_status='notstarted'
                    )

            # Update user subscription type and puzzle status based on subscription type
            user_subscription = Subscription.objects.get(user=user)
            plan = PlanTable.objects.get(plan_type=user_subscription_type)
            user_subscription.plan_data = plan
            user_subscription.save()

            # Get puzzle status data for the user
            puzzle_status_data = UserDataTableStatus.objects.filter(user=user)

            # Get a selection of puzzles based on subscription type
            easy_puzzles = list(DataTable.objects.filter(task_id=1, level='EASY').order_by('puzzle_id')[:5])
            medium_puzzles = list(DataTable.objects.filter(task_id=1, level='MEDIUM').order_by('puzzle_id')[:5])
            hard_puzzles = list(DataTable.objects.filter(task_id=1, level='HARD').order_by('puzzle_id')[:5])
            need_puzzle_data = easy_puzzles + medium_puzzles + hard_puzzles

            # Update puzzle status based on subscription type
            if user_subscription_type == 'PREMIUM':
                for puzzle in puzzle_status_data:
                    puzzle.puzzle_locked = False
                    puzzle.save()
            elif user_subscription_type == 'BASIC':
                for puzzle in puzzle_status_data:
                    puzzle.puzzle_locked = True
                    puzzle.save()
                for puzzle in need_puzzle_data:
                    puzzle_lock = UserDataTableStatus.objects.get(user=user, data_table=puzzle)
                    puzzle_lock.puzzle_locked = False
                    puzzle_lock.save()
            else:
                # For other subscription types, lock all puzzles
                for puzzle in puzzle_status_data:
                    puzzle.puzzle_locked = True
                    puzzle.save()
                for puzzle in need_puzzle_data:
                    puzzle_lock = UserDataTableStatus.objects.get(user=user, data_table=puzzle)
                    puzzle_lock.puzzle_locked = False
                    puzzle_lock.save()

            # Return success response
            return JsonResponse({'status': True, 'message': 'Puzzles Updated'})

        except CustomUser.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User not found'})
        except PlanTable.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'Puzzle not found'})
        except Subscription.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'Subscription not found'})


# View for buying puzzle
@csrf_exempt
def buy_puzzle(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_email = data.get('email')
            puzzle_id = data.get('puzzle_id')
            task_id = data.get('task_id')
            
            user = CustomUser.objects.get(email=user_email)
            puzzle = DataTable.objects.get(puzzle_id=puzzle_id, task_id=task_id)
            puzzle_locked = UserDataTableStatus.objects.get(user=user, data_table=puzzle)
            wallet_balance = UserProfile.objects.get(user=user)
            puzzle_price = puzzle.puzzle_price
            
            # check for wallet balance for purchase puzzle
            if puzzle_locked.puzzle_locked:
                if puzzle_price <= wallet_balance.wallet:
                    wallet_balance.wallet -= puzzle_price
                    puzzle_locked.puzzle_locked = False
                    wallet_balance.save()
                    puzzle_locked.save()
                    return JsonResponse({'status': True, 'message': 'Puzzle purchased successfully'})
                else:
                    return JsonResponse({'status': False, 'message': 'Insufficient balance in wallet'})
            else:
                return JsonResponse({'status': False, 'message': 'Puzzle is already unlocked'})
        
        except CustomUser.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User not found'})
        except DataTable.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'Puzzle not found'})
        except UserDataTableStatus.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'Puzzle status not found'})
        except UserProfile.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User profile not found'})
        except Exception as e:
            return JsonResponse({'status': False, 'message': str(e)}) 

# View for checking if a puzzle is locked for a user.
@csrf_exempt
def check_puzzle_locked(request):
    if request.method == 'POST':
        try:
            # Load request data
            data = json.loads(request.body)
            user_email = data.get('email')
            puzzle_id = data.get('puzzle_id')
            task_id = data.get('task_id')

            # Get user
            user = CustomUser.objects.get(email=user_email)
            
            # Get puzzle
            puzzle = DataTable.objects.get(puzzle_id=puzzle_id, task_id=task_id)
            
            # Get puzzle status for the user
            puzzle_locked = UserDataTableStatus.objects.get(user=user, data_table=puzzle)

            # Return puzzle locked status
            return JsonResponse({'status': True, 'puzzle_locked': puzzle_locked.puzzle_locked})
        
        except CustomUser.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User not found'})
        
        except DataTable.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'Puzzle not found'})
        
        except UserDataTableStatus.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'Puzzle status not found'})
        
        except Exception as e:
            return JsonResponse({'status': False, 'message': str(e)})
    
    else:
        return JsonResponse({'status': False, 'message': 'Only POST requests are allowed'})

