# from channels.routing import ProtocolTypeRouter, URLRouter
# from thirtyone.consumers import ThirtyOneConsumer
# from django.urls import re_path

# from django.core.asgi import get_asgi_application
# from django.core.wsgi import get_wsgi_application

# application = ProtocolTypeRouter({
#     'http': get_asgi_application(),
#     'websocket': URLRouter([re_path('', ThirtyOneConsumer.as_asgi())])
# })