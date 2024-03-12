from django.contrib import admin
from .models import CustomUser, Admin, DataTable, UserProfile, Subscription, LogReport, PlanTable, UserDataTableStatus,FAQ,Feedback

# Registering models with the Django admin site to manage them via the admin interface

# Registering the CustomUser model
admin.site.register(CustomUser)

# Registering the Admin model
admin.site.register(Admin)

# Registering the DataTable model
admin.site.register(DataTable)

# Registering the UserProfile model
admin.site.register(UserProfile)

# Registering the Subscription model
admin.site.register(Subscription)

# Registering the LogReport model
admin.site.register(LogReport)

# Registering the Plan model
admin.site.register(PlanTable)

# Registering the UserDataTableStatus model
admin.site.register(UserDataTableStatus)

# Registering the FAQ model
admin.site.register(FAQ)

# Registering the Feedback model
admin.site.register(Feedback)