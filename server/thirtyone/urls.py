from django.urls import path
from . import views

urlpatterns = [
    path('create_table', views.create_table, name="create_table"),
    path('get_tables', views.get_tables, name="get_tables"),
]