from django import forms
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Profile
from .models import UserTrack

class UploadTrackForm(forms.ModelForm):
    class Meta:
        model = UserTrack
        fields = ['title', 'artist', 'album', 'audio_file', 'cover_image']
        widgets = {
            'audio_file': forms.FileInput(attrs={'accept': 'audio/*'}),
            'cover_image': forms.FileInput(attrs={'accept': 'image/*'}),
        }

class RegisterForm(forms.ModelForm):
    email = forms.EmailField(widget=forms.EmailInput(attrs={'class': 'inp_reg', 'placeholder': 'Email'}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'inp_reg', 'placeholder': 'Password'}))
    username = forms.CharField(widget=forms.TextInput(attrs={'class': 'inp_reg', 'placeholder': 'What should we call you?'}))
    marketing_consent = forms.BooleanField(required=True, widget=forms.CheckboxInput(attrs={'class': 'txt_marketing'}))
    
    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'marketing_consent']

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data['password'])
        if commit:
            user.save()
        return user

class LoginForm(forms.Form):
    username = forms.CharField(widget=forms.TextInput(attrs={'class': 'inp_reg', 'placeholder': 'Username'}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'inp_reg', 'placeholder': 'Password'}))

    def clean(self):
        cleaned_data = super().clean()
        username = cleaned_data.get('username')
        password = cleaned_data.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise forms.ValidationError("Неверное имя пользователя или пароль.")
        return cleaned_data

class AvatarUploadForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['avatar']
