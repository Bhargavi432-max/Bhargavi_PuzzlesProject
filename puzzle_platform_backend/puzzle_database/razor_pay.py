from django.shortcuts import render
from django.http import JsonResponse, HttpResponseBadRequest
import razorpay
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
import json

# Authorize Razorpay client with API Keys.
razorpay_client = razorpay.Client(auth=(settings.RAZOR_KEY_ID, settings.RAZOR_KEY_SECRET))

@csrf_exempt
def homepage(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            amount = int(data.get('amount', 0)) * 100  # Convert to integer and multiply by 100 for paise
            currency = 'INR'

            # Create a Razorpay Order
            razorpay_order = razorpay_client.order.create(dict(amount=amount, currency=currency, payment_capture='0'))
            razorpay_order_id = razorpay_order['id']
            callback_url = '/paymenthandler/'

            # Pass necessary details to frontend
            context = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_merchant_key': settings.RAZOR_KEY_ID,
                'razorpay_amount': amount,
                'currency': currency,
                'callback_url': callback_url
            }

            return JsonResponse(context)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    else:
        return HttpResponseBadRequest("Only POST requests are allowed")

# we need to csrf_exempt this url as
# POST request will be made by Razorpay
# and it won't have the csrf token.
@csrf_exempt
def paymenthandler(request):

	# only accept POST request.
	if request.method == "POST":
		try:
		
			# get the required parameters from post request.
			payment_id = request.POST.get('razorpay_payment_id', '')
			razorpay_order_id = request.POST.get('razorpay_order_id', '')
			signature = request.POST.get('razorpay_signature', '')
			params_dict = {
				'razorpay_order_id': razorpay_order_id,
				'razorpay_payment_id': payment_id,
				'razorpay_signature': signature
			}

			# verify the payment signature.
			result = razorpay_client.utility.verify_payment_signature(
				params_dict)
			if result is not None:
				amount = 100 # Rs. 200
				try:

					# capture the payemt
					razorpay_client.payment.capture(payment_id, amount)

					# render success page on successful caputre of payment
					return render(request, '../templates/paymentsuccess.html')
				except:

					# if there is an error while capturing payment.
					return render(request, '../templates/paymentfail.html')
			else:

				# if signature verification fails.
				return render(request, '../templates/paymentfail.html')
		except:

			# if we don't find the required parameters in POST data
			return HttpResponseBadRequest()
	else:
	# if other than POST request is made.
		return HttpResponseBadRequest()