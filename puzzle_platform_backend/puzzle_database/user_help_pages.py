from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import CustomUser,Subscription,FAQ,Feedback,PlanTable,UserProfile
from django.core.mail import send_mail
import json
from django.conf import settings
import re


# This function gets all subscription details.
@csrf_exempt
def get_subscription_details(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_email =  data.get('email')
            user = CustomUser.objects.get(email=user_email)
            subscription_type = Subscription.objects.get(user=user).plan_data.plan_type
            wallet_balance=UserProfile.objects.get(user=user).wallet
            subscription_details = {
                'plan_type': subscription_type,
                'wallet':wallet_balance,
                'name':user.username,
            }
            return JsonResponse({'status': True, 'subscription_details': subscription_details})
        except Subscription.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'Subscription not found'})
    else:
        return JsonResponse({'error': 'Only GET requests are allowed'})
    
# This function gets all plan details.
@csrf_exempt
def get_all_plans(request):
    
    print("request.method")
    if request.method == 'POST':
        print('Enter')
        plans = PlanTable.objects.all()
        plan_list = []
        for plan in plans:
            plan_dict = {
                'plan_type': plan.plan_type,
                'plan_price': plan.plan_price,
                'benefits': plan.benefits,
            }
            plan_list.append(plan_dict)
        print(plan_list)
        return JsonResponse({'status': True, 'plans': plan_list})
    else:
        return JsonResponse({'error': 'Only GET requests are allowed'})
    

# This function adds a new FAQ entry.
@csrf_exempt
def add_faq(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        question = data.get('question')
        answer = data.get('answer')

        if not (question and answer):
            return JsonResponse({'status': False, 'message': 'Both question and answer are required'})

        FAQ.objects.create(question=question, answer=answer)
        return JsonResponse({'status': True, 'message': 'FAQ added successfully'})
    else:
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=400)
    
    
# This view function retrieves all FAQs.
def retrieve_faqs(request):
    faqs = FAQ.objects.all()
    faq_list = [{'question': faq.question, 'answer': faq.answer} for faq in faqs]

    return JsonResponse({'status': True, 'faqs': faq_list})

# This function handles the feedback submission form.
@csrf_exempt
def add_feedback(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user_email = data.get('email')
        rating = data.get('rating')
        print(type(rating))
        review = data.get('review')
        print(user_email,rating,review)

        if not (rating and review and user_email):
            return JsonResponse({'status': False, 'message': 'All fields are required'})
        
        user = CustomUser.objects.get(email=user_email)

        Feedback.objects.create(user=user, rating=rating, review=review)
        
        return JsonResponse({'status': True, 'message': 'Feedback form submitted successfully'})
    else:
        return JsonResponse({'status': False, 'message': 'Only POST requests are allowed'})


# This function handles the contact form submission.
@csrf_exempt
def contact_us(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        name = data.get('name')
        email = data.get('email')
        mobile_number = data.get('phoneNumber')
        
        if not (name and email and mobile_number):
            return JsonResponse({'status': False, 'message': 'All fields are required'})
        if not re.match(r'^[6-9]\d{9}$', mobile_number):
                return JsonResponse({'status': False, 'message': 'Invalid mobile number format'})
        
        subject = 'Contact Form Submission'
        message = f'Name: {name}\nEmail: {email}\nMobile Number: {mobile_number}'
        email_from = settings.DEFAULT_FROM_EMAIL
        recipient_email = 'uday80022@example.com'
        send_mail(subject, message, email_from, [recipient_email])
        
        return JsonResponse({'status': True, 'message': 'Contact form submitted successfully'})
    else:
        return JsonResponse({'status': False, 'message': 'Only POST requests are allowed'})





