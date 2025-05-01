from django.urls import path
from django.contrib.auth import views as auth_views
from . import views
from django.urls import path
from . import views
from django.views.generic.base import RedirectView


urlpatterns = [
    path('favicon.ico', RedirectView.as_view(url='/static/favicon.ico')),
    path('', views.home_page, name='home_page'),
    path('search/', views.search_tracks, name='search_tracks'),
    path('reg/', views.register, name='reg_page'),
	path('sign/', views.login_user, name='sign_page'),
    path('upload_track/', views.upload_track, name='upload_track'),
    path('profile/', views.profile_page, name='profile_page'),
    path('logout/', views.logout_user, name='logout'),
    path('upload_avatar/', views.upload_avatar, name='upload_avatar'),
    path("like/", views.like_track, name="like_track"),
    path('add_to_favorites/', views.add_to_favorites, name='add_to_favorites'),
    path("remove_from_favorites/", views.remove_from_favorites, name="remove_from_favorites"),
]

