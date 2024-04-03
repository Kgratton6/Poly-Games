from django.db import models
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
import json

class BaseSocketConsumer(WebsocketConsumer):

    def emit_event(self, event):
        self.send(text_data=json.dumps({
            'event': event['event'],
            'data': event['data']
        }))

    def broadcast(self, event, data):
        async_to_sync(self.channel_layer.group_send)(
            self.roomId, {'type': 'emit_event', 'event': event, 'data': data}
        )

    def broadcast_exept(self, event, data):
        async_to_sync(self.channel_layer.group_send)(
            self.roomId, 
            {'type': 'emit_event_exept', 'sender_name': self.channel_name, 'event': event, 'data': data}
        )

    def emit_event_exept(self, event):
        if self.channel_name != event['sender_name']:
            self.send(text_data=json.dumps({
                'event': event['event'],
                'data': event['data'],
            }))
    
    def emit(self, event, data):
        self.send(text_data=json.dumps({
            'event': event, 
            'data': data,
        }))

    def add_to_group(self, roomId, token):
        self.roomId = roomId
        self.token = token
        async_to_sync(self.channel_layer.group_add)(
            self.roomId,
            self.channel_name
        )

# TODO : only temporaty, switch to Redis after : group_channels = async_to_sync(channel_layer.group_channels)(self.roomId)
def getUserToSend(user):
    return {
        "username": user.username,
        "email": user.email,
        "firstName": user.first_name,
        "lastName": user.last_name,
        "icon": user.icon,
        "isOnline": user.is_online,
    }

class TableManager():

    def __init__(self):
        self.tables = {}

    def get_table(self, table_id):
        return self.tables.get(table_id)

    def create_table(self, table_id):
        if table_id not in self.tables:
            self.tables[table_id] = Table(table_id)
            return True
        return False
    
    def delete_table(self, table_id):
        if table_id in self.tables:
            del self.tables[table_id]
            return True
        return False

class Table():

    def __init__(self, table_id):
        self.table_id = table_id
        self.users = []

    def add_user(self, user_token):
        if user_token not in self.users:
            self.users.append(user_token)
            return True
        return False
    
    def remove_user(self, user_token):
        if user_token in self.users:
            self.users.remove(user_token)
            return True
        return False

    def get_users(self):
        return self.users

