from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path('', consumers.ThirtyOneConsumer.as_asgi()),
]