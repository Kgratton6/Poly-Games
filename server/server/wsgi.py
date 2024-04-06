import os
import sys

# assuming your Django settings file is at
# '/home/myusername/mysite/mysite/settings.py'
# path = '../../server'
# if path not in sys.path:
#      sys.path.insert(0, path)

# os.environ['DJANGO_SETTINGS_MODULE'] = 'server.settings'

# from django.core.wsgi import get_wsgi_application
# application = get_wsgi_application()

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "server.settings")

application = get_wsgi_application()