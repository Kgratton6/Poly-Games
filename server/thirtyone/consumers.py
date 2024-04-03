import json
from rest_framework.authtoken.models import Token
from .models import BaseSocketConsumer
import json
from channels.layers import get_channel_layer
from django.contrib.auth import get_user_model
from asgiref.sync import async_to_sync
User = get_user_model()

import logging
logger = logging.getLogger(__name__) # use logger.debug()

class ThirtyOneConsumer(BaseSocketConsumer):

    # Needs to match SendEvents in the consts of client
    eventHandlers = {
        'broadcastMessage': 'broadcast_message',
        'broadcastMessageExept': 'broadcast_message_exept'
    }

    def connect(self):
        if(self.verify_connection()):
            self.accept()
            self.send_table_data()
    
    def disconnect(self, code):
        return super().disconnect(code)

    def receive(self, text_data=None):
        message = json.loads(text_data)
        event = message.get('event')
        data = message.get('data') or 'No data'

        handler_name = self.eventHandlers.get(event)
        if handler_name:
            getattr(self, handler_name)(data)
        else:
            self.emit('error', 'Server receved an unexpected event')

    
    def verify_connection(self):
        tableId, tableToken = self.scope['path_remaining'].split('/')
        token = Token.objects.get(key=tableToken)
        self.add_to_group(tableId, token) # peut etre juste garder le token 
        return True 
        # TODO : verifier la token si il est dans une room, si oui : ajouter dans la room
        # TODO : verifier si c'est : new player, refresh, si la room est complete ou commencé

    def send_table_data(self):
        self.emit('connectionConfirmation', 'Connection réussie dans la room : ' + self.roomId) 
        self.emit('connectionConfirmation', 'vous etez : ' + str(self.token))

        # TODO : envoyer les donnés de la room (players) si entre dans la room
        # TODO : emit le state de la room si refresh 
    
    # Functions to handle the receved messages
    def broadcast_message(self, data):
        self.broadcast('newMessage', 'message broadcast : ' + data)

    def broadcast_message_exept(self, data):
        self.broadcast_exept('newMessage', 'message broadcast exept : ' + data)



