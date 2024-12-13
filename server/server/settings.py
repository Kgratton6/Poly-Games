from pathlib import Path
import os
from corsheaders.defaults import default_headers

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = 'django-insecure-cq59z=c%3)sczjqu#=iw5q-r59wo@+xfai7_den2mcmvp3p+cs'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']
CORS_ALLOWED_ORIGINS = [ "http://localhost:4200", "https://www.poly-games.online", "poly-games-9283.vercel.app"]
CORS_ALLOW_HEADERS = ("token", "content-type")
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_HEADERS = True

ASGI_APPLICATION = "server.asgi.application"
WSGI_APPLICATION = 'server.wsgi.application'
 
INSTALLED_APPS = [
    'daphne',
    'channels',
    'corsheaders',
    'users',
    'thirtyone',
    'uno',

    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework.authtoken',

    'whitenoise.runserver_nostatic',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    'whitenoise.middleware.WhiteNoiseMiddleware',
]

ROOT_URLCONF = 'server.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Databases 

# users :
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# tables :
CHANNEL_LAYERS = {
    "default": {
        "CONFIG": {
            "hosts": ['redis://default:GI6JYdB9HWkj6MQ8iU6XVnd90y8KH4Gm@redis-18431.c81.us-east-1-2.ec2.redns.redis-cloud.com:18431'],
        },
        "BACKEND": "channels_redis.core.RedisChannelLayer",
    },
}

AUTH_USER_MODEL = 'users.User'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT=os.path.join(BASE_DIR,'static/')
MEDIA_ROOT=os.path.join(BASE_DIR,'media')
MEDIA_URL='/media/'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
   'DEFAULT_PERMISSION_CLASSES': [
       'rest_framework.permissions.IsAuthenticated',
   ],
   'DEFAULT_AUTHENTICATION_CLASSES': (
       'rest_framework.authentication.SessionAuthentication',
       'rest_framework.authentication.TokenAuthentication',
   )
}

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        '': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}

