from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('polyPoints', 'icon', 'is_online')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('polyPoints', 'is_online')}),
    )

admin.site.register(User, CustomUserAdmin)