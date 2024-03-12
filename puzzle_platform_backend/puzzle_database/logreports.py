from django.http import JsonResponse,HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from .models import LogReport, CustomUser
import json
from django.utils import timezone

@csrf_exempt
def log_login_register_otp(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_email = data.get('email')
            action_item = data.get('action_item')
            print(user_email,action_item)
            user = CustomUser.objects.get(email=user_email)
            print(user)
            log_report = LogReport(
                user=user,
                action_item=action_item,
            )
            print(log_report)
            log_report.save()
            print(log_report)
            return JsonResponse({'status': True, 'message': 'User login status log entered'})

        except CustomUser.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User not found'})
        except Exception as e:
            return JsonResponse({'status': False, 'message': str(e)})

    else:
        return JsonResponse({'status': False, 'message': 'Only POST requests are allowed'})
    
@csrf_exempt
def log_task_click(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_email = data.get('email')
            task_id = data.get('task_id')
            action_item = data.get('action_item')   
            print('Task Click')
            print(user_email,task_id,action_item)
            user = CustomUser.objects.get(email=user_email)

            log_entry = LogReport(
                user=user,
                task_id=task_id,
                action_item=action_item,
            )
            print(log_entry)
            log_entry.save()

            return JsonResponse({'status': True, 'message': 'Task click log entered'})

        except CustomUser.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User not found'})
        except Exception as e:
            return JsonResponse({'status': False, 'message': str(e)})

    else:
        return JsonResponse({'status': False, 'message': 'Only POST requests are allowed'})


@csrf_exempt
def log_puzzle_click(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_email = data.get('email')
            task_id = data.get('task_id')
            puzzle_id = data.get('puzzle_id')
            question_view_status = data.get('question_view_status')
            video_view_status = data.get('video_view_status')
            puzzle_status = data.get('puzzle_status')
            task_status = data.get('task_status')
            start_time = data.get('start_time')
            end_time = data.get('end_time')
            action_item = data.get('action_item')
            print('---------------------------------')
            print(question_view_status,video_view_status,puzzle_status,task_status,start_time,end_time,action_item)
            user = CustomUser.objects.get(email=user_email)

            log_entry = LogReport(
                user=user,
                task_id=task_id,
                puzzle_id=puzzle_id,
                question_view_status=question_view_status,
                video_view_status=video_view_status,
                puzzle_status=puzzle_status,
                task_status=task_status,
                start_time=start_time,
                end_time=end_time,
                action_item=action_item,
            )
            print(log_entry)  
            log_entry.save()

            return JsonResponse({'status': True, 'message': 'Puzzle Status logged entered'})

        except CustomUser.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User not found'})
        except Exception as e:
            return JsonResponse({'status': False, 'message': str(e)})

    else:
        return JsonResponse({'status': False, 'message': 'Only POST requests are allowed'})


@csrf_exempt
def log_wallet_spend(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_email = data.get('email')
            task_id = data.get('task_id')
            puzzle_id = data.get('puzzle_id')
            price_spend = data.get('price_spend')
            action_item = data.get('action_item')

            user = CustomUser.objects.get(email=user_email)

            log_entry = LogReport(
                user=user,
                task_id=task_id,
                puzzle_id=puzzle_id,
                price_spend=price_spend,
                action_item=action_item,
                timestamp=timezone.now()
            )
            log_entry.save()

            return JsonResponse({'status': True, 'message': 'Money spend logged successfully'})

        except CustomUser.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User not found'})
        except Exception as e:
            return JsonResponse({'status': False, 'message': str(e)})

    else:
        return JsonResponse({'status': False, 'message': 'Only POST requests are allowed'})


def log_tester(request):
    data = LogReport.objects.get(id=4)
    print(data.start_time)
    data.video_view_status=False
    data.question_view_status = True
    data.start_time = timezone.make_aware(timezone.datetime(2024, 1, 13, 9, 15, 30))
    data.end_time = timezone.make_aware(timezone.datetime(2024, 3, 13, 9, 15, 30))
    data.save()
    return HttpResponse(data.video_view_status)