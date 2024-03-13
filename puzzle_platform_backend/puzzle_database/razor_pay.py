from django.shortcuts import render
import razorpay
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponseBadRequest, JsonResponse,HttpResponseRedirect
import json

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
                'callback_url': 'http://127.0.0.1:8000/api/paymenthandler/'+email+'/'
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
def paymenthandler(request,email):
    if request.method == "POST":
        try:
            print(request.POST)
            payment_id = request.POST.get('razorpay_payment_id', '')
            razorpay_order_id = request.POST.get('razorpay_order_id', '')
            signature = request.POST.get('razorpay_signature', '')
            print(email)
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature
            }
            result = razorpay_client.utility.verify_payment_signature(params_dict)
            print(params_dict,result)
            if result is not None:
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
