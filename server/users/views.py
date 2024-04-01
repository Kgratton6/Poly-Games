
from django.contrib.auth import authenticate
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
from .decorators import require_token_auth
from django.core.validators import validate_email
import logging
import json
User = get_user_model()

logger = logging.getLogger(__name__) # use logger.debug()

def getUserToSend(user):
    return {
        "username": user.username,
        "email": user.email,
        "firstName": user.first_name,
        "lastName": user.last_name,
        "icon": user.icon,
        "isOnline": user.is_online,
    }

def changeOnlineStatus(user, isOnline):
    user.is_online = isOnline
    user.save()


@require_http_methods(["POST"])
def login_user(request):
    data = json.loads(request.body)
    username = data.get('username')
    password = data.get('password')
    
    user = authenticate(request, username=username, password=password) # TODO : trop long à repondre ( moins long quand c'est le mauvais mot de passe)
    if user is None:
        return JsonResponse({"error": "Wrong email or password"}, status=401)
    
    changeOnlineStatus(user, True) # TODO : juste faire pour isOnline 1 fois
    token, created = Token.objects.get_or_create(user=user) 
    return JsonResponse({"token": token.key }, status=200)


@require_token_auth
@require_http_methods(["POST"])
def logout_user(request):
    changeOnlineStatus(request.user, False) # TODO : juste faire pour isOFfline 1 fois
    token_key = request.headers['token']
    Token.objects.get(key=token_key).delete()
    return JsonResponse({}, status=200)


@require_token_auth
@require_http_methods(["POST"])
def is_logged_in(request):
    return JsonResponse({}, status=200)


@require_token_auth
@require_http_methods(["GET"])
def get_profile(request):
    return JsonResponse(getUserToSend(request.user), status=200)
    

@require_http_methods(["GET"])
def get_all_users(request):
    try:
        users = User.objects.all()
        users_data = [
            getUserToSend(user) for user in users
        ]
        return JsonResponse(users_data, safe=False, status=200)
    except:
        return JsonResponse({"error": "Server error when fetching users"}, status=500)


@require_http_methods(["GET"]) 
def get_one_user(request, asked_username=''):
    try:
        user = User.objects.get(username=asked_username)
        user_data = getUserToSend(user)
        return JsonResponse(user_data, safe=False, status=200)
    except:
        return JsonResponse({"error": "User not found"}, status=404)
    

@require_token_auth
@require_http_methods(["PATCH"])
def user_online(request):
    changeOnlineStatus(request.user, True)
    return JsonResponse({}, status=200)

@require_token_auth
@require_http_methods(["PATCH"])
def user_offline(request):
    changeOnlineStatus(request.user, False)
    return JsonResponse({}, status=200)


@require_http_methods(["POST"])
def create_user(request):     
    data = json.loads(request.body)
    user_data = data.get('user')
    password = data.get('password')

    # double verification after the client verification
    required_fields = ['username', 'email', 'firstName', 'lastName', 'icon']
    missing_fields = [field for field in required_fields if not user_data.get(field)]
    if missing_fields:
        return JsonResponse({"error": "Missing fields: " + ", ".join(missing_fields)}, status=400)
    
    try:
        validate_email(user_data['email'])
    except:
        return JsonResponse({"error": "Invalid email format"}, status=400)
    
    if ' ' in user_data['username']:
        return JsonResponse({"error": "Username cannot contain spaces"}, status=400)

    if User.objects.filter(username=user_data['username']).exists():
        return JsonResponse({"error": "This username already exists"}, status=409)

    try:
        secretPassword = make_password(password)   # TODO : trop long à repondre
        User.objects.create(
            username=user_data.get('username'),
            email=user_data.get('email'),
            first_name=user_data.get('firstName'),
            last_name=user_data.get('lastName'),
            icon=user_data.get('icon'),
            password=secretPassword,
        )
        return JsonResponse({}, status=201)
    except:
        return JsonResponse({"error": "Server error when creating the account"}, status=500)
    