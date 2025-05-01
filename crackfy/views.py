from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.models import User
from .forms import RegisterForm
from .forms import LoginForm
from django.contrib.auth import authenticate, login
from django.contrib.auth import logout
from django.shortcuts import redirect
from django.shortcuts import render
from .music_service import MusicAPI
from .forms import AvatarUploadForm
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import FavoriteTrack
from .forms import UploadTrackForm
from .models import UserTrack

images = {
    "ogbuda": "users/images/ogbuda.jpg",
    "163onmyneck": "users/images/163onmyneck.jpg",
    "kweensize": "users/images/kweensize.jpg",
    "lilmosey": "users/images/lilmosey.jpg",
    "august": "users/images/august.jpg",
    "theweeknd": "users/images/TheWeeknd.jpg",
    "4nway": "users/images/4nway.jpg",
    "playboi": "users/images/playboi.jpg",
    "fendiglock": "users/images/fendiglock.jpg",
    "rocket": "users/images/rocket.jpg",
    "postmalone": "users/images/postmalone.jpg",
    "august": "users/images/august.jpg",
    "theweeknd": "users/images/TheWeeknd.jpg",
    "playlistRepeat": "users/images/playlistRepeat.svg",
    "tracknext": "users/images/nextTrackPlaylist.svg",
    "Library_S": "users/images/+Library_S.svg",
    "Author": "users/images/Author.svg",
    "Back": "users/images/Back.svg",
    "backTrack": "users/images/backTrack.svg",
    "ChooseImage": "users/images/ChooseImage.jpg",
    "Clock_XS": "users/images/Clock_XS.svg",
    "Close_S": "users/images/Close_S.svg",
    "down": "users/images/down.svg",
    "Forward": "users/images/Forward.svg",
    "heartLiked": "users/images/heartLiked.svg",
    "Home_Fill_S": "users/images/Home_Fill_S.svg",
    "Like": "users/images/Like.svg",
    "Liked": "users/images/Liked Songs_S.svg",
    "LikeLittle": "users/images/LikeLittle.svg",
    "Next": "users/images/Next.svg",
    "nextTrack": "users/images/nextTrack.svg",
    "Play_Greem": "users/images/Play_Greem Hover.svg",
    "Play": "users/images/Play.svg",
    "playTrack": "users/images/playTrack.svg",
    "pauseTrack": "users/images/pauseTrack.svg",
    "Repeat": "users/images/Repeat.svg",
    "repeatTrack": "users/images/repeatTrack.svg",
    "Search_S_wh": "users/images/Search_S_wh.svg",
    "Search_S": "users/images/Search_S.svg",
    "search": "users/images/search.svg",
    "sound": "users/images/sound.svg",
    "Spotify_logo": "users/images/Spotify_logo.svg",
}

#Request

def home_page(request):
    return render(request, "users/index.html", context={"images": images})

def search_page(request):
    return render(request, "users/indexSearch.html", context={"images": images})

def reg_page(request):
    return render(request, "users/indexRegister.html", context={"images": images})

def sign_page(request):
    return render(request, "users/indexSign.html", context={"images": images})

def like_page(request):
    return render(request, "users/indexliked.html", context={"images": images})

def profile_page(request):
    return render(request, "users/indexProfile.html", context={"images": images})

def logout_user(request):
    logout(request)
    return redirect('/profile/')

def register(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            username = form.cleaned_data['username']

            if not User.objects.filter(username=username).exists():
                user = User.objects.create_user(username=username, password=password, email=email)
                user.save()
                messages.success(request, 'Регистрация прошла успешно.')
                return redirect('../profile/')  # или на любую другую страницу
            else:
                messages.error(request, 'Пользователь с таким именем уже существует.')
        else:
            messages.error(request, 'Пожалуйста, исправьте ошибки в форме.')
    else:
        form = RegisterForm()
    return render(request, 'users/indexRegister.html', {'form': form, 'images': images})

def login_user(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']

            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, 'Вы успешно вошли в систему.')
                return redirect('/profile/')  # Перенаправляем на страницу профиля после входа
            else:
                messages.error(request, 'Неверное имя пользователя или пароль.')
    else:
        form = LoginForm()

    return render(request, 'users/indexSign.html', {'form': form, 'images': images})

def search_tracks(request):
    query = request.GET.get("q")
    api_key = "8600438ee5msh03314d4c974390cp1e1407jsn0e4e90770acc"
    deezer = MusicAPI(api_key)
    tracks = []

    if query:
        request.session["last_search_query"] = query
        tracks = deezer.search_tracks(query)
    elif "last_search_query" in request.session:
        query = request.session["last_search_query"]
        tracks = deezer.search_tracks(query)

    return render(request, "users/indexSearch.html", {"tracks": tracks, "query": query, "images": images})

#Func

@login_required
def upload_avatar(request):
    if request.method == 'POST':
        form = AvatarUploadForm(request.POST, request.FILES, instance=request.user.profile)
        if form.is_valid():
            form.save()
            return JsonResponse({
                'success': True,
                'avatar_url': request.user.profile.avatar.url
            })
        else:
            return JsonResponse({'success': False}, status=400)
    return JsonResponse({'success': False}, status=405)

@login_required
def add_to_favorites(request):
    if request.method == "POST":
        track_id = request.POST.get("track_id")
        title = request.POST.get("title")
        artist = request.POST.get("artist")
        preview_url = request.POST.get("preview_url")
        cover = request.POST.get('cover')
        album = request.POST.get('album')
        duration = request.POST.get('duration')

        # Проверяем, есть ли этот трек уже в избранном
        if FavoriteTrack.objects.filter(user=request.user, track_id=track_id).exists():
            return JsonResponse({"message": "Трек уже в избранном", "status": "exists"}, status=200)

        # Добавляем в избранное
        FavoriteTrack.objects.create(
            user=request.user,
            track_id=track_id,
            title=title,
            artist=artist,
            preview_url=preview_url,
            cover=cover,
            album=album,
            duration=duration,
        )

        return JsonResponse({"message": "Трек добавлен в избранное", "status": "success"}, status=201)
    return JsonResponse({"message": "Неверный запрос"}, status=400)

@login_required
def remove_from_favorites(request):
    if request.method == "POST":
        track_id = request.POST.get("track_id")
        print(f"Получен track_id: {track_id}")
        try:
            track = FavoriteTrack.objects.get(user=request.user, track_id=track_id)
            track.delete()
            return JsonResponse({"status": "success", "message": "Трек удален из избранного"})
        except FavoriteTrack.DoesNotExist:
            print(f"Трек с track_id={track_id} для пользователя {request.user} не найден")
            return JsonResponse({"status": "error", "message": "Трек не найден"})
    return JsonResponse({"status": "error", "message": "Неверный запрос"}, status=400)

@login_required
def like_track(request):
    favorites = FavoriteTrack.objects.filter(user=request.user)
    return render(request, "users/indexliked.html", context={"favorites": favorites, "images": images})

@login_required
def upload_track(request):
    if request.method == 'POST':
        form = UploadTrackForm(request.POST, request.FILES)
        if form.is_valid():
            track = form.save(commit=False)
            track.user = request.user
            track.save()
            return JsonResponse({'success': True, 'track_id': track.id})
        return JsonResponse({'success': False, 'errors': form.errors})
    return JsonResponse({'success': False}, status=405)

@login_required
def profile_page(request):
    tracks = UserTrack.objects.filter(user=request.user).order_by('-created_at')
    return render(request, "users/indexProfile.html", {
        "images": images,
        "user_tracks": tracks,
    })