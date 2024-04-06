from django.urls import path

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from thirtyone.consumers import ThirtyOneConsumer
from django.urls import re_path

application = ProtocolTypeRouter({
    #'http':get_asgi_application(),
    'websocket': URLRouter([re_path('', ThirtyOneConsumer.as_asgi())])
})