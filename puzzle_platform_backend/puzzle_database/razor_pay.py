from django.shortcuts import render
import razorpay
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponseBadRequest, JsonResponse,HttpResponseRedirect
import json
from .models import CustomUser,Subscription,PlanTable,UserDataTableStatus,DataTable,PaymentHistory

# Authorize razorpay client with API Keys.
razorpay_client = razorpay.Client(auth=(settings.RAZOR_KEY_ID, settings.RAZOR_KEY_SECRET))

@csrf_exempt
def order_create(request):
    print(request.method)
    if request.method == "POST":
        try:
            # Extract the amount from the request
            data = json.loads(request.body)
            amount = data.get('amount')
            email =data.get('email')
            amount=int(float(amount))
            print(amount)
            currency = 'INR'
            
            # Initialize Razorpay client
            razorpay_client = razorpay.Client(auth=(settings.RAZOR_KEY_ID, settings.RAZOR_KEY_SECRET))
            
            # Create a Razorpay Order
            razorpay_order = razorpay_client.order.create(dict(amount=amount * 100,  # Converting to paise
                                                               currency=currency,
                                                               payment_capture='0'))
            print(razorpay_order)

            # Pass the order details to frontend.
            context = {
                'razorpay_order_id': razorpay_order['id'],
                'razorpay_merchant_key': settings.RAZOR_KEY_ID,
                'razorpay_amount': amount,
                'currency': currency,
                'callback_url': 'http://127.0.0.1:8000/api/paymenthandler/'+email+'/'+str(amount)+'/'
            }
            print(context)
            return JsonResponse(context)
        except Exception as e:
            # Handle exceptions
            print(e)
            return HttpResponseBadRequest()
    else:
        return HttpResponseBadRequest()

@csrf_exempt
def paymenthandler(request,email,amount):
    if request.method == "POST":
        try:
            print(request.POST)
            payment_id = request.POST.get('razorpay_payment_id', '')
            razorpay_order_id = request.POST.get('razorpay_order_id', '')
            signature = request.POST.get('razorpay_signature', '')
            print(email,amount)
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature
            }
            result = razorpay_client.utility.verify_payment_signature(params_dict)
            print(params_dict,result)
            if result is not None:

                user = CustomUser.objects.get(email = email)
                plan = PlanTable.objects.get(plan_price=amount)
                print(user,plan)
                subscription = Subscription.objects.get(user=user)
                subscription.plan_data = plan
                subscription.save()
                user_plan_type = plan.plan_type
                print(user_plan_type)
                change_data_type(email,user_plan_type)

                payment_history = PaymentHistory.objects.create(
                    user=user,
                    plan=plan,
                    transaction_id=payment_id
                )
                # Handle payment success
                # You might want to update your database or perform other actions here
                return HttpResponseRedirect('http://localhost:3000/success')
            else:
                # Handle payment failure due to signature verification failure
                return HttpResponseRedirect('http://localhost:3000/fail')
        except Exception as e:
            # Handle exceptions
            return JsonResponse({"status": "error", "message": str(e)})
    else:
        # Handle non-POST requests
        return HttpResponseBadRequest()


def change_data_type(email,subscripton_type):

    user_subscription_type = subscripton_type
    user = CustomUser.objects.get(email = email)
    plan = PlanTable.objects.get(plan_type=subscripton_type)
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

@csrf_exempt
def get_payment_history(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        try:
            user = CustomUser.objects.get(email=email)
            user_payment_history = PaymentHistory.objects.filter(user=user)
            payment_history_data = []

            for history in user_payment_history:
                payment_data = {
                    'date': history.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                    'action': 'Payment',
                    'transaction_id': history.transaction_id,
                    'amount': history.plan.plan_price
                }
                payment_history_data.append(payment_data)

            return JsonResponse({'payment_history': payment_history_data})
        except CustomUser.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)

    return JsonResponse({'error': 'Invalid request method'}, status=400)