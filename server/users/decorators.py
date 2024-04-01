from functools import wraps
from rest_framework.authtoken.models import Token
from django.http import JsonResponse

def authenticateToken(request):
    try:
        token_key = request.headers['token']
        token = Token.objects.get(key=token_key)
        return token.user
    except Token.DoesNotExist:
        return None
    
def require_token_auth(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        user = authenticateToken(request)
        if user is None:
            return JsonResponse({"error": "You need to login to see this content"}, status=401)
        request.user = user
        return view_func(request, *args, **kwargs)
    return _wrapped_view