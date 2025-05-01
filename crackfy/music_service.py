import requests
from django.conf import settings

class MusicAPI:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://deezerdevs-deezer.p.rapidapi.com"

    def search_tracks(self, query):
        url = f"{self.base_url}/search"
        headers = {
            "X-RapidAPI-Key": self.api_key,
            "X-RapidAPI-Host": "deezerdevs-deezer.p.rapidapi.com"
        }
        params = {"q": query}
        response = requests.get(url, headers=headers, params=params)

        if response.status_code != 200:
            print(f"❌ Ошибка {response.status_code}: {response.text}")
            return []

        data = response.json()
        tracks = []
        for track in data.get("data", []):
            tracks.append({
                "id": track["id"],
                "title": track["title"],
                "album": track["album"],
                "duration": track["duration"],
                "artist": track["artist"]["name"],
                "album": track["album"]["title"],
                "cover": track["album"]["cover_medium"],
                "link": track["link"],
                "preview": track.get("preview")
            })
        return tracks
    
api_key = "8600438ee5msh03314d4c974390cp1e1407jsn0e4e90770acc"
deezer = MusicAPI(api_key)
tracks = deezer.search_tracks("Eminem")