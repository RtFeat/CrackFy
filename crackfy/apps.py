# apps.py
from django.apps import AppConfig

class CrackfyConfig(AppConfig):
    name = 'crackfy'

    def ready(self):
        import crackfy.signals
