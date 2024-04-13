# import os
# import django
# from channels.routing import get_default_application

# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "server.settings")
# django.setup()
# application = get_default_application()

import os
import django
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "server.settings")
django.setup()
from channels.routing import ProtocolTypeRouter, URLRouter
from thirtyone.consumers import ThirtyOneConsumer
from django.urls import re_path

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': URLRouter([re_path('ws/thirty-one', ThirtyOneConsumer.as_asgi())])
})