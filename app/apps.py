from django.apps import AppConfig


class AppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app'
    
    def ready(self):
        """Import signals when the app is ready"""
        import app.models  # This will trigger the signal registration
