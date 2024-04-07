# import os

# from django.core.asgi import get_asgi_application
# from channels.routing import ProtocolTypeRouter, URLRouter
# from thirtyone.consumers import ThirtyOneConsumer
# from django.urls import re_path

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')

# application = ProtocolTypeRouter({
#     #'http':get_asgi_application(),
#     'websocket': URLRouter(re_path('', ThirtyOneConsumer.as_asgi()))
# })


import os
import django
from channels.routing import get_default_application
from server.routing import *

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "server.settings")
application = get_default_application()
