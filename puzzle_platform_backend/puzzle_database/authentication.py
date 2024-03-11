from django.contrib.auth.hashers import check_password
from .models import CustomUser, Admin

# This function is used to authenticate an admin based on email and password.
def authenticate_admin(email, password):
    try:
        admin = Admin.objects.get(admin_email=email)
        if admin.admin_password == password:
            return admin
        else:
            return None
    except Admin.DoesNotExist:
        return None

# This function is used to authenticate a custom user based on email and password.
def authenticate_user(email, password):
    try:
        user = CustomUser.objects.get(email=email)
        if check_password(password, user.password):
            return user
        else:
            return None
    except CustomUser.DoesNotExist:
        return None
