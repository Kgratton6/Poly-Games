from django.contrib import admin
from django.urls import path
from django.urls import include, path
from django.conf import settings
from  django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('user/', include('django.contrib.auth.urls')),
    path('user/', include("users.urls")),
    path('thirtyone/', include("thirtyone.urls")), # TODO : faire les demandes http pour get les id des rooms
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root = settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root = settings.STATIC_URL)
