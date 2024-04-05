from django.shortcuts import render
import razorpay
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponseBadRequest, JsonResponse,HttpResponseRedirect
import json
from .models import CustomUser,Subscription,PlanTable,UserDataTableStatus,DataTable,PaymentHistory

# Authorize razorpay client with API Keys.
razorpay_client = razorpay.Client(auth=(settings.RAZOR_KEY_ID, settings.RAZOR_KEY_SECRET))

# View for creating a payment order.
@csrf_exempt
def order_create(request):
    print(request.method)
    if request.method == "POST":
        try:
            # Extract the amount and email from the request
            data = json.loads(request.body)
            amount = data.get('amount')
            email =data.get('email')
            amount=int(float(amount)) # Convert amount to integer
            currency = 'INR'
            
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

# View for handling payment completion.
@csrf_exempt
def paymenthandler(request, email, amount):
    if request.method == "POST":
        try:
            # Extract payment details from the request
            payment_id = request.POST.get('razorpay_payment_id', '')
            razorpay_order_id = request.POST.get('razorpay_order_id', '')
            signature = request.POST.get('razorpay_signature', '')
            
            # Verify the payment signature
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature
            }
            result = razorpay_client.utility.verify_payment_signature(params_dict)

            # If signature is verified
            if result is not None:
                # Update user's subscription and payment history
                user = CustomUser.objects.get(email=email)
                plan = PlanTable.objects.get(plan_price=amount)
                subscription = Subscription.objects.get(user=user)
                subscription.plan_data = plan
                subscription.save()
                payment_history = PaymentHistory.objects.create(
                    user=user,
                    plan=plan,
                    transaction_id=payment_id
                )
                # Change puzzle status based on subscription type
                change_data_type(email, plan.plan_type)

                # Redirect to success page
                return HttpResponseRedirect('http://localhost:3000/success')
            else:
                # Redirect to failure page due to signature verification failure
                return HttpResponseRedirect('http://localhost:3000/fail')
        except Exception as e:
            # Handle exceptions
            return JsonResponse({"status": "error", "message": str(e)})
    else:
        # Handle non-POST requests
        return HttpResponseBadRequest()


# Function to change puzzle status based on subscription type
def change_data_type(email, subscription_type):
    # Retrieve user and plan
    user = CustomUser.objects.get(email=email)
    plan = PlanTable.objects.get(plan_type=subscription_type)
    user_subscription = Subscription.objects.get(user=user)
    user_subscription.plan_data = plan
    user_subscription.save()

    # Get puzzle status data
    puzzle_status_data = UserDataTableStatus.objects.filter(user=user)

    # Get necessary puzzles based on subscription type
    easy_puzzles = list(DataTable.objects.filter(task_id=1, level='EASY').order_by('puzzle_id')[:5])
    medium_puzzles = list(DataTable.objects.filter(task_id=1, level='MEDIUM').order_by('puzzle_id')[:5])
    hard_puzzles = list(DataTable.objects.filter(task_id=1, level='HARD').order_by('puzzle_id')[:5])
    need_puzzle_data = easy_puzzles + medium_puzzles + hard_puzzles    

    # Change puzzle status based on subscription type
    if subscription_type == 'PREMIUM':
        for puzzle in puzzle_status_data:
            puzzle.puzzle_locked = False
            puzzle.save()
    elif subscription_type == 'BASIC':
        for puzzle in puzzle_status_data:
            puzzle.puzzle_locked = True
            puzzle.save()
        for puzzle in need_puzzle_data:
            puzzle_lock = UserDataTableStatus.objects.get(user=user, data_table=puzzle)
            puzzle_lock.puzzle_locked = False
            puzzle_lock.save()

# View for getting payment history of a user.
@csrf_exempt
def get_payment_history(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        try:
            # Retrieve user and their payment history
            user = CustomUser.objects.get(email=email)
            user_payment_history = PaymentHistory.objects.filter(user=user)
            payment_history_data = []

            # Construct payment history data
            for history in user_payment_history:
                payment_data = {
                    'date': history.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                    'action': 'Payment',
                    'transaction_id': history.transaction_id,
                    'amount': history.plan.plan_price
                }
                payment_history_data.append(payment_data)

            return JsonResponse({'success': True, 'payment_history': payment_history_data})
        except CustomUser.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'User not found'}, status=404)

    return JsonResponse({'error': 'Invalid request method'}, status=400)
