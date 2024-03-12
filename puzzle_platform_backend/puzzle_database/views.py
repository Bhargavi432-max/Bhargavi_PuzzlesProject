from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import CustomUser,Subscription,DataTable,UserDataTableStatus,UserProfile
import json

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
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_email = data.get('email')
            user = CustomUser.objects.get(email=user_email)
            user_statistics = {
                'completed_puzzles': UserDataTableStatus.objects.filter(user=user, puzzle_status='completed').count(),
                'incompleted_puzzles': UserDataTableStatus.objects.filter(user=user, puzzle_status='incompleted').count(),
                'notstarted_puzzles': UserDataTableStatus.objects.filter(user=user, puzzle_status='notstarted').count(),
            }
            return JsonResponse({'status': True, 'user_statistics': user_statistics})
        except CustomUser.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User not found'})
        except UserDataTableStatus.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'UserData TableStatus not found'})
    else:
        return JsonResponse({'error': 'Only GET requests are allowed'}, status=400)
    
@csrf_exempt
def get_user_taskwise_statistics(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_email = data.get('email')
            task_id = data.get('task_id')

            user = CustomUser.objects.get(email=user_email)
            task_statistics  = {
                'completed_puzzles': UserDataTableStatus.objects.filter(user=user, data_table__task_id=task_id, puzzle_status='completed').count(),
                'incompleted_puzzles': UserDataTableStatus.objects.filter(user=user, data_table__task_id=task_id, puzzle_status='incompleted').count(),
                'notstarted_puzzles': UserDataTableStatus.objects.filter(user=user, data_table__task_id=task_id, puzzle_status='notstarted').count(),
            }
            print(task_statistics)
            return JsonResponse({'status': True, 'user_statistics': task_statistics })
        except CustomUser.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User not found'})
        except UserDataTableStatus.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'UserData TableStatus not found'})
    else:
        return JsonResponse({'error': 'Only GET requests are allowed'}, status=400)

@csrf_exempt
def mark_puzzle_status(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_email = data.get('email')
            task_id = data.get('task_id')
            puzzle_id = data.get('puzzle_id')
            puzzle_status = data.get('puzzle_status').lower()
            time_spent = data.get('time_spent')
            print(user_email,task_id,puzzle_id,puzzle_status,time_spent)
            
            user = CustomUser.objects.get(email=user_email)
            puzzle = DataTable.objects.get(task_id=task_id, puzzle_id=puzzle_id)
            status = UserDataTableStatus.objects.get(user=user, data_table=puzzle)
            print(status.puzzle_status)
            if status.puzzle_status == 'completed':
                return JsonResponse({'status': False, 'message': 'Puzzle already completed'})
            status.puzzle_status = puzzle_status
            status.save()
            task_puzzles_count = DataTable.objects.filter(task_id=task_id).count()
            print("puzzlecount:",task_puzzles_count)

            completed_puzzles_count = UserDataTableStatus.objects.filter(
                user=user, data_table__task_id=task_id, puzzle_status='completed'
            ).count()
            print("completedpuzzlecount:",completed_puzzles_count)
            incompleted_puzzles_count = UserDataTableStatus.objects.filter(
                user=user, data_table__task_id=task_id, puzzle_status='completed'
            ).count()
            print("incompletedpuzzlecount:",incompleted_puzzles_count)
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

            return JsonResponse({'status': True, 'message': 'Puzzle and Task status are Updated'})
        
        except CustomUser.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User not found'})
        except DataTable.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'Puzzle not found'})
        except UserDataTableStatus.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'UserDataTableStatus not found'})
    else:
        return JsonResponse({'error': 'Only POST requests are allowed'})


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
            puzzle = DataTable.objects.get(puzzle_id=puzzle_id, task_id=task_id)
            subscription_type = Subscription.objects.get(user=user).plan_data.plan_type
            puzzle_locked = UserDataTableStatus.objects.get(user=user , data_table=puzzle).puzzle_locked
            wallet_balance = UserProfile.objects.get(user=user).wallet
            puzzle_price = puzzle.puzzle_price
            start_index = puzzle.puzzle_video.path.find('videos')
            relative_path = puzzle.puzzle_video.path[start_index:].replace('\\', '/')

            puzzle_data = {
                'video': relative_path,
                'question': puzzle.puzzle_question,
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
