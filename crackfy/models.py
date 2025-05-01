# models.py
from django.db import models
from mutagen import File
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    avatar = models.ImageField(upload_to='avatars/', default='avatars/default_avatar.png')

    def __str__(self):
        return self.user.username

class FavoriteTrack(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    track_id = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    artist = models.CharField(max_length=255)
    album = models.CharField(max_length=255, null=True)
    duration = models.IntegerField(null=True)
    cover = models.URLField(null=True, blank=True)
    preview_url = models.URLField()

    @property
    def formatted_duration(self):
        if self.duration is not None:
            minutes = self.duration // 60
            seconds = self.duration % 60
            return f"{minutes}:{seconds:02d}"
        return None
    
    def __str__(self):
        return f"{self.user.username} - {self.title} by {self.artist}"
    
class UserTrack(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    artist = models.CharField(max_length=255, blank=True, null=True)
    album = models.CharField(max_length=255, blank=True, null=True)
    audio_file = models.FileField(upload_to='user_tracks/')
    cover_image = models.ImageField(upload_to='track_covers/', blank=True, null=True)
    duration = models.IntegerField(blank=True, null=True)  # в секундах
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not self.duration and self.audio_file:
            try:
                import mutagen
                audio = mutagen.File(self.audio_file.path)
                if audio:
                    self.duration = int(audio.info.length)
                    super().save(update_fields=['duration'])
            except:
                pass

    @property
    def formatted_duration(self):
        if self.duration:
            minutes = self.duration // 60
            seconds = self.duration % 60
            return f"{minutes}:{seconds:02d}"
        return "0:00"

    def __str__(self):
        return f"{self.title} - {self.artist or 'Unknown'}"