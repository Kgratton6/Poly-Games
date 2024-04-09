# import os
# from channels.routing import get_default_application
# from server.routing import *

# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "server.settings")
# application = get_default_application()


# peut etre ca mieux
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
from django.core.asgi import get_asgi_application

django_asgi_app = get_asgi_application()
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from thirtyone.consumers import ThirtyOneConsumer
from django.urls import re_path

from django.core.wsgi import get_wsgi_application

application = ProtocolTypeRouter({
    'http':get_wsgi_application(),
    'websocket': URLRouter([re_path('', ThirtyOneConsumer.as_asgi())])
})