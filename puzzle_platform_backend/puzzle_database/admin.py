from django.contrib import admin
from .models import CustomUser, Admin, DataTable, UserProfile, Subscription, Report, Plan, UserDataTableStatus


admin.site.register(CustomUser)
admin.site.register(Admin)
admin.site.register(DataTable)
admin.site.register(UserProfile)
admin.site.register(Subscription)
admin.site.register(Report)
admin.site.register(Plan)
admin.site.register(UserDataTableStatus)

