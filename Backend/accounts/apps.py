from django.apps import AppConfig


class AccountsConfig(AppConfig):
    name = 'accounts'

    def ready(self):
        from .rag import build_index
        try:
            build_index()
        except:
            pass