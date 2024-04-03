from django.http import JsonResponse,HttpResponse
from django.views.decorators.csrf import csrf_exempt
from .models import CustomUser,Subscription,DataTable,UserDataTableStatus,UserProfile,PlanTable,LogReport
import json
from datetime import timedelta
from django.db.models import Count
from datetime import date
from django.db.models.functions import TruncDate

# View for retrieving all data of puzzle of the task along with their statuses.
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
                    'puzzle_count': status.puzzle_count, 
                    'video_count': status.video_count,
                }
                for obj, status in zip(data_table_objects, status_objects)
            ]
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

            # Calculate the time spent on the puzzles
            total_time_spent_seconds = 0

            for status in user_data_statuses:
                total_time_spent_seconds += status.time_spent

            # Convert total time spent to hours, minutes, and seconds
            total_time_spent = timedelta(seconds=total_time_spent_seconds)
            total_hours = total_time_spent.seconds // 3600
            total_minutes = (total_time_spent.seconds % 3600) // 60
            total_seconds = total_time_spent.seconds % 60

            completed_puzzles_by_level = {
                'EASY': 0,
                'MEDIUM': 0,
                'HARD': 0
            }
            total_puzzles_by_level = {
                'EASY': DataTable.objects.filter(level='EASY').count(),
                'MEDIUM': DataTable.objects.filter(level='MEDIUM').count(),
                'HARD': DataTable.objects.filter(level='HARD').count()
            }
            print(total_puzzles_by_level)

            for status in user_data_statuses:
                if status.puzzle_status == 'completed':
                    level = status.data_table.level
                    completed_puzzles_by_level[level] += 1

            # Calculate the percentage of completed puzzles for each level
            percentage_completed_by_level = {}
            for level in completed_puzzles_by_level:
                total_puzzles = total_puzzles_by_level[level]
                if total_puzzles > 0:
                    percentage_completed = (completed_puzzles_by_level[level] / total_puzzles) * 100
                    percentage_completed_by_level[level] = round(percentage_completed, 2)
                else:
                    percentage_completed_by_level[level] = 0
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
            total_puzzles_count = UserDataTableStatus.objects.filter(user=user).count()
            user_statistics = {
                'completed_puzzles': (UserDataTableStatus.objects.filter(user=user, puzzle_status='completed').count() / total_puzzles_count) * 100,
                'incompleted_puzzles': (UserDataTableStatus.objects.filter(user=user, puzzle_status='incompleted').count()  / total_puzzles_count) * 100,
                'notstarted_puzzles': (UserDataTableStatus.objects.filter(user=user, puzzle_status='notstarted').count()  / total_puzzles_count) * 100,
                'total_time_spent': {
                    'hours': total_hours,
                    'minutes': total_minutes,
                    'seconds': total_seconds
                },
                'percentage_completed_by_level': percentage_completed_by_level,
                'completed_each_task':completed_in_tasks,
                'username':user.username,
                'college_name':user.college_name,
                'education':user.education,
            }
            print(user_statistics)


            return JsonResponse({'status': True, 'user_statistics': user_statistics})
        except CustomUser.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User not found'})
        except UserDataTableStatus.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'UserData TableStatus not found'})
    else:
        return JsonResponse({'error': 'Only GET requests are allowed'}, status=400)
    

#  View for retrieving user puzzle statistics task-wise.
@csrf_exempt
def get_user_taskwise_statistics(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_email = data.get('email')
            task_id = data.get('task_id')

            user = CustomUser.objects.get(email=user_email)

            easy_time_taken = sum(status.time_spent for status in UserDataTableStatus.objects.filter(user=user, data_table__task_id=task_id, puzzle_status='completed', data_table__level='EASY'))
            medium_time_taken = sum(status.time_spent for status in UserDataTableStatus.objects.filter(user=user, data_table__task_id=task_id, puzzle_status='completed', data_table__level='MEDIUM'))
            hard_time_taken = sum(status.time_spent for status in UserDataTableStatus.objects.filter(user=user, data_table__task_id=task_id, puzzle_status='completed', data_table__level='HARD'))

            easy_time_taken = timedelta(seconds=easy_time_taken)
            easy_hours = easy_time_taken.seconds // 3600
            easy_minutes = (easy_time_taken.seconds % 3600) // 60
            easy_seconds = easy_time_taken.seconds % 60

            medium_time_taken = timedelta(seconds=medium_time_taken)
            medium_hours = medium_time_taken.seconds // 3600
            medium_minutes = (medium_time_taken.seconds % 3600) // 60
            medium_seconds = medium_time_taken.seconds % 60

            hard_time_taken = timedelta(seconds=hard_time_taken)
            hard_hours = hard_time_taken.seconds // 3600
            hard_minutes = (hard_time_taken.seconds % 3600) // 60
            hard_seconds = hard_time_taken.seconds % 60

             # Fetching completed puzzles count by date
            completed_puzzles_by_date = LogReport.objects.filter(user=user, task_id=task_id, puzzle_status='completed').annotate(completed_date=TruncDate('timestamp')).values('completed_date').annotate(count=Count('id'))
            # Converting queryset to a dictionary
            completed_puzzles_by_date_dict = {
                entry['completed_date'].strftime('%d-%B-%Y'): entry['count'] 
                for entry in completed_puzzles_by_date
            }
            print(completed_puzzles_by_date_dict)

            completed_puzzles_by_level = {
                'EASY': UserDataTableStatus.objects.filter(user=user, data_table__task_id=task_id, puzzle_status='completed', data_table__level='EASY').count(),
                'MEDIUM': UserDataTableStatus.objects.filter(user=user, data_table__task_id=task_id, puzzle_status='completed', data_table__level='MEDIUM').count(),
                'HARD': UserDataTableStatus.objects.filter(user=user, data_table__task_id=task_id, puzzle_status='completed', data_table__level='HARD').count(),
            }
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
            return JsonResponse({'status': True, 'user_statistics': task_statistics })
        except CustomUser.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User not found'})
        except UserDataTableStatus.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'UserData TableStatus not found'})
    else:
        return JsonResponse({'error': 'Only GET requests are allowed'}, status=400)

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

            print(puzzle_count,video_count)
            print(time_spent)
            
            user = CustomUser.objects.get(email=user_email)
            puzzle = DataTable.objects.get(task_id=task_id, puzzle_id=puzzle_id)
            status = UserDataTableStatus.objects.get(user=user, data_table=puzzle)
            user_subscription_type = Subscription.objects.get(user=user).plan_data.plan_type

            status.puzzle_count += puzzle_count
            status.video_count += video_count
            status.save()

            next_puzzles_part = str(int(puzzle_id[-2:])+1)
            if len(next_puzzles_part)==1:
                next_puzzles_part = '0'+next_puzzles_part

            next_puzzle_id = puzzle_id[:-2]+next_puzzles_part
            data = DataTable.objects.filter(puzzle_id=next_puzzle_id).exists()
            if not data:
                next_puzzles_part = str(int(puzzle_id[5:7])+1)
                if len(next_puzzles_part)==1:
                    next_puzzles_part = '0'+next_puzzles_part
                next_puzzle_id = puzzle_id[:5]+next_puzzles_part +'-01'
                print([puzzle_id,next_puzzle_id])
                data = DataTable.objects.filter(puzzle_id=next_puzzle_id).exists()
                if data:
                    next_puzzle_data = DataTable.objects.get(puzzle_id=next_puzzle_id)
            print(next_puzzle_id)

            if status.puzzle_status == 'completed':
                return JsonResponse({'status': True, 'message': 'Puzzle already completed','next_puzzle_id':next_puzzle_id})
            hours, minutes, seconds_with_milliseconds = time_spent.split(":")
            seconds, milliseconds = seconds_with_milliseconds.split(".")
            hours = int(hours)
            minutes = int(minutes)
            seconds = int(seconds)
            total_seconds = (hours * 3600) + (minutes * 60) + seconds
            status.puzzle_status = puzzle_status
            status.time_spent = total_seconds
            status.save()

            if user_subscription_type=='BASIC':
                next_puzzles_part = str(int(puzzle_id[-2:])+1)
                if len(next_puzzles_part)==1:
                    next_puzzles_part = '0'+next_puzzles_part

                next_puzzle_id = puzzle_id[:-2]+next_puzzles_part
                data = DataTable.objects.filter(puzzle_id=next_puzzle_id).exists()
                if not data:
                    next_puzzles_part = str(int(puzzle_id[5:7])+1)
                    if len(next_puzzles_part)==1:
                        next_puzzles_part = '0'+next_puzzles_part
                    next_puzzle_id = puzzle_id[:5]+next_puzzles_part +'-01'
                    print([puzzle_id,next_puzzle_id])
                    data = DataTable.objects.filter(puzzle_id=next_puzzle_id).exists()
                    if data:
                        next_puzzle_data = DataTable.objects.get(puzzle_id=next_puzzle_id)
                        status = UserDataTableStatus.objects.get(user=user, data_table=next_puzzle_data)
                        status.puzzle_locked = False
                        status.save()
                else:
                    next_puzzle_data = DataTable.objects.get(puzzle_id=next_puzzle_id)
                    status = UserDataTableStatus.objects.get(user=user, data_table=next_puzzle_data)
                    status.puzzle_locked = False
                    status.save()

            task_puzzles_count = DataTable.objects.filter(task_id=task_id).count()
           

            completed_puzzles_count = UserDataTableStatus.objects.filter(
                user=user, data_table__task_id=task_id, puzzle_status='completed'
            ).count()
           
            incompleted_puzzles_count = UserDataTableStatus.objects.filter(
                user=user, data_table__task_id=task_id, puzzle_status='incompleted'
            ).count()

            if completed_puzzles_count == task_puzzles_count:
                task_statuses = UserDataTableStatus.objects.filter(
                    user=user, data_table__task_id=task_id
                )
                for task_status in task_statuses:
                    task_status.task_status = 'completed'
                    task_status.save()
            elif incompleted_puzzles_count>0:
                task_statuses = UserDataTableStatus.objects.filter(
                    user=user, data_table__task_id=task_id
                )
                for task_status in task_statuses:
                    task_status.task_status = 'incompleted'
                    task_status.save()
            

            return JsonResponse({'status': True, 'message': 'Puzzle and Task status are Updated','next_puzzle_id':next_puzzle_id})
        
        except CustomUser.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User not found'})
        except DataTable.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'Puzzle not found'})
        except UserDataTableStatus.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'UserDataTableStatus not found'})
    else:
        return JsonResponse({'error': 'Only POST requests are allowed'})

# View for sending puzzle video question.
@csrf_exempt
def get_puzzle_access(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_email = data.get('email')
            puzzle_id = data.get('puzzle_id')
            task_id = data.get('task_id')
            print(puzzle_id)
            user = CustomUser.objects.get(email=user_email)
            puzzle = DataTable.objects.get(puzzle_id=puzzle_id, task_id=task_id)
            puzzle_locked = UserDataTableStatus.objects.get(user=user , data_table=puzzle).puzzle_locked
            start_index = puzzle.puzzle_video.path.find('videos')
            relative_path = puzzle.puzzle_video.path[start_index:].replace('\\', '/')

            current_state = UserProfile.objects.get(user=user)
            current_state.user_in_task = task_id
            current_state.user_in_puzzle=puzzle_id
            current_state.save()

            puzzle_data = {
                'video': relative_path,
                'question': puzzle.puzzle_question,
                'code':puzzle.puzzle_code,
                'puzzle_locked':puzzle_locked,
                'interview_code':puzzle.puzzle_interview_code,
                'puzzle_name':puzzle.puzzle_name,
                'status': 'User has access to the puzzle',
            }
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

# View for sending task status.
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

# View for linking user with it subscription.
@csrf_exempt
def link_subscription_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_email = data.get('email')
            user_subscription_type = data.get('user_subscription_type')

            puzzles = DataTable.objects.all()

            # Get users - you may have your own way of retrieving users
            user = CustomUser.objects.get(email=user_email)

            # Loop through each user and each puzzle to create UserDataTableStatus instances
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


            user = CustomUser.objects.get(email=user_email)
            plan = PlanTable.objects.get(plan_type=user_subscription_type)
            user_subscription = Subscription.objects.get(user=user)
            user_subscription.plan_data = plan
            user_subscription.save()
            puzzle_status_data = UserDataTableStatus.objects.filter(user=user)

            easy_puzzles = list(DataTable.objects.filter(task_id=1,level='EASY').order_by('puzzle_id')[:5])
            medium_puzzles = list(DataTable.objects.filter(task_id=1,level='MEDIUM').order_by('puzzle_id')[:5])
            hard_puzzles = list(DataTable.objects.filter(task_id=1,level='HARD').order_by('puzzle_id')[:5])
            print(hard_puzzles)
            need_puzzle_data = easy_puzzles + medium_puzzles + hard_puzzles

            if user_subscription_type=='PREMIUM':
                for puzzle in puzzle_status_data:
                    puzzle.puzzle_locked = False
                    puzzle.save()
            elif user_subscription_type == 'BASIC':
                for puzzle in puzzle_status_data:
                    puzzle.puzzle_locked = True
                    puzzle.save()
                for puzzle in need_puzzle_data:
                    puzzle_lock = UserDataTableStatus.objects.get(user=user,data_table=puzzle)
                    puzzle_lock.puzzle_locked = False
                    puzzle_lock.save()
            else:
                print("Enter")
                for puzzle in puzzle_status_data:
                    puzzle.puzzle_locked = True
                    puzzle.save()
                for puzzle in need_puzzle_data:
                    puzzle_lock = UserDataTableStatus.objects.get(user=user,data_table=puzzle)
                    puzzle_lock.puzzle_locked = False
                    puzzle_lock.save()

            
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


@csrf_exempt
def check_puzzle_locked(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_email = data.get('email')
            puzzle_id = data.get('puzzle_id')
            task_id = data.get('task_id')
            print(user_email,puzzle_id,task_id)

            user = CustomUser.objects.get(email=user_email)
            puzzle = DataTable.objects.get(puzzle_id=puzzle_id, task_id=task_id)
            puzzle_locked = UserDataTableStatus.objects.get(user=user, data_table=puzzle)

            return JsonResponse({'status': True, 'puzzle_locked':puzzle_locked.puzzle_locked})
        except CustomUser.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User not found'})
        except DataTable.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'Puzzle not found'})
        except UserDataTableStatus.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'Puzzle status not found'})
        except Exception as e:
            return JsonResponse({'status': False, 'message': str(e)}) 
