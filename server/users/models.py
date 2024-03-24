from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.
class User(AbstractUser):
    polyPoints = models.IntegerField(default=0)
    icon = models.CharField(default='spade', max_length=50)
    is_online = models.BooleanField(default=False)