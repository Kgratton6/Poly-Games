from django.contrib import admin
from django.urls import path
from django.urls import include, path
from django.conf import settings
from  django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('user/', include('django.contrib.auth.urls')),
    path('user/', include("users.urls")),
    path('thirty-one/', include("thirtyone.urls")),
    path('uno/', include("uno.urls")),
]
