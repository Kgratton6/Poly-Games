from django.urls import path
from . import views

urlpatterns = [
    path('login_user', views.login_user, name="login_user"),
    path('logout_user', views.logout_user, name='logout_user'),
    path("is_logged_in", views.is_logged_in, name="is_logged_in"),
    path("create_user", views.create_user, name="create_user"),
    path("profile", views.profile, name="profile"),
    path("fetch_users", views.fetch_users, name="fetch_users"),
    path("fetch_user/<str:asked_username>", views.fetch_user, name="fetch_user"),
]