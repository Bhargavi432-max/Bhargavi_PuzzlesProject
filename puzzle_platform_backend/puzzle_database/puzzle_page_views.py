import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import CustomUser,DataTable,UserDataTableStatus,UserProfile,Subscription


# View for retrieving all data of puzzle of the task along with their statuses.
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
