from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework.authtoken.models import Token
import json
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
from urllib.parse import unquote

# Create your views here.

import logging
logger = logging.getLogger(__name__)
# use logger.debug()

# Create your views here.

def authenticateToken(token_key):
    try:
        token = Token.objects.get(key=token_key)
        # user = token.user
        # if user.is_authenticated:
        #     return JsonResponse({"message": "User is logged in"}, status=200)
        return True
    except Token.DoesNotExist:
        return False

@csrf_exempt
@require_http_methods(["POST"])
def login_user(request):

    data = json.loads(request.body)
    username = data.get('username')
    password = data.get('password')
    
    user = authenticate(request, username=username, password=password)
    if user:
        #login(request, user)
        user.is_online = True
        user.save()
        token, created = Token.objects.get_or_create(user=user) 
        return JsonResponse({"token": token.key }, status=200)
    else:
        return JsonResponse({"error": "Wrong email or password"}, status=401)

@csrf_exempt
@require_http_methods(["POST"])
def logout_user(request):

    data = json.loads(request.body)
    token_key = data.get('token')

    try:
        token = Token.objects.get(key=token_key)
        user = token.user

        user.is_online = False
        user.save()
        token.delete()
        #logout(request)
        return JsonResponse({"message": "User has been logged out."}, status=200)
    except:
        return JsonResponse({"error": "Already logout"}, status=401)

@csrf_exempt
@require_http_methods(["POST"])
def is_logged_in(request):

    data = json.loads(request.body)
    token = data.get('token')

    if authenticateToken(token):
        return JsonResponse({"message": "User is logged in"}, status=200)
    else:
        return JsonResponse({"error": "User is not logged in"}, status=401)
    

@csrf_exempt
@require_http_methods(["POST"])
def create_user(request):

    data = json.loads(request.body)
    user = data.get('user')
    username = user['username']
    email = user['email']
    first_name=user['firstName']
    last_name=user['lastName']
    icon=user['icon']
    password = data.get('password')

    User = get_user_model()

    if User.objects.filter(username=user['username']).exists():
        return JsonResponse({"error": "Username already exists"}, status=409)

    try:
        hashed_password = make_password(password)
        user = User.objects.create(username=username, email=email, first_name=first_name,
                                   last_name=last_name, icon=icon, password=hashed_password )
        user.save()
        return JsonResponse({"message": "Created account with sucess"}, status=201)
    except:
        return JsonResponse({"error": "Server error "}, status=500)
    
@csrf_exempt
@require_http_methods(["POST"])
def profile(request):

    data = json.loads(request.body)
    token_key = data.get('token')

    try:
        token = Token.objects.get(key=token_key)
        user = token.user

        if authenticateToken(token):
            user_data = {
                "username": user.username,
                "email": user.email,
                "firstName": user.first_name,
                "lastName": user.last_name,
                "icon": user.icon,
                "isOnline": user.is_online,
            }
            return JsonResponse(user_data, status=200)
        else:
            return JsonResponse({"error": "You are not connected"}, status=401)
    except:
        return JsonResponse({"error": "You are not connected"}, status=401)
    
@csrf_exempt
@require_http_methods(["GET"])
def fetch_users(request):

    User = get_user_model()

    try:
        users = User.objects.all()
        users_data = [
                {
                    "username": user.username,
                    "email": user.email,
                    "firstName": user.first_name,
                    "lastName": user.last_name,
                    "icon": user.icon,
                    "isOnline": user.is_online,
                } for user in users
            ]
        return JsonResponse(users_data, safe=False, status=200)
    except:
        return JsonResponse({"error": "Error fetching users"}, status=500)
    
@csrf_exempt
@require_http_methods(["GET"])
def fetch_user(request, asked_username=''):

    User = get_user_model()

    try:
        user = User.objects.get(username=asked_username)
        user_data = {
                "username": user.username,
                "email": user.email,
                "firstName": user.first_name,
                "lastName": user.last_name,
                "icon": user.icon,
                "isOnline": user.is_online,
        }
        return JsonResponse(user_data, safe=False, status=200)
    except:
        return JsonResponse({"error": "User not found"}, status=404)

# faire fonctionner CSRF pour la communication secure
# serialise?
# faire fonctionner les cookies login, loutout request.user.is_authenticated 
# refactor de http request et service pour pas faire des demandes à chaque changement de page
# 1 demande pour prifle, 1 demande pour les users.
    
# probleme avec tokens 1 : quelqun peut prendre le token de quelqun
# si lutilisateur est connecté, il pourra avoir acces au compte avec le token
# probleme avec tokens 2 : si un joueur oublie de se deconnecter, son token reste
# actif comme si il etati encore en ligne

# fini!
    