from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import CustomUser,Subscription,FAQ,Feedback
from django.core.mail import send_mail
import json
from django.conf import settings

@csrf_exempt
def get_subscription_details(request):
    if request.method == 'POST':
        try:
            user_email = request.POST.get('email')
            user = CustomUser.objects.get(email=user_email)
            subscription_data = Subscription.objects.get(user=user).plan_data
            subscription_details = {
                'plan_type': subscription_data.plan_type,
                'plan_price':subscription_data.plan_price,
                'benefits':subscription_data.benefits,
            }
            return JsonResponse({'status': True, 'subscription_details': subscription_details})
        except Subscription.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'Subscription not found'})
    else:
        return JsonResponse({'error': 'Only GET requests are allowed'})
    

# This view function adds a new FAQ entry.
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
        data = request.POST
        rating = data.get('rating')
        review = data.get('review')

        if not (rating and review):
            return JsonResponse({'status': False, 'message': 'All fields are required'})

        Feedback.objects.create(rating=rating, review=review)
        
        return JsonResponse({'status': True, 'message': 'Feedback form submitted successfully'})
    else:
        return JsonResponse({'status': False, 'message': 'Only POST requests are allowed'})


# This function handles the contact form submission.
@csrf_exempt
def contact_us(request):
    if request.method == 'POST':
        data = request.POST
        name = data.get('name')
        email = data.get('email')
        mobile_number = data.get('mobile_number')
        
        if not (name and email and mobile_number):
            return JsonResponse({'status': False, 'message': 'All fields are required'})
        
        subject = 'Contact Form Submission'
        message = f'Name: {name}\nEmail: {email}\nMobile Number: {mobile_number}'
        email_from = settings.DEFAULT_FROM_EMAIL
        recipient_email = 'uday80022@example.com'
        send_mail(subject, message, email_from, [recipient_email])
        
        return JsonResponse({'status': True, 'message': 'Contact form submitted successfully'})
    else:
        return JsonResponse({'status': False, 'message': 'Only POST requests are allowed'})





