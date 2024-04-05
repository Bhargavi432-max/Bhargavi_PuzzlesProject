import json
from .models import CustomUser
from .models import UserProfile
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def get_wallet_balance(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_email = data.get('email')
            
            user = CustomUser.objects.get(email=user_email)
            wallet_balance = UserProfile.objects.get(user=user).wallet
            
            return JsonResponse({'status': True, 'wallet_balance': wallet_balance})
        
        except CustomUser.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User not found'})
        except UserProfile.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'User profile not found'})
        except Exception as e:
            return JsonResponse({'status': False, 'message': str(e)}) 
