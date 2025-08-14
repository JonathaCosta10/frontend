# 🔧 Configurações do Backend para Atualizar

## 1. Atualizar ALLOWED_HOSTS

No seu `settings.py`, substitua a linha:

```python
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='127.0.0.1,localhost,organizesee.com.br,front-teal-beta-95.vercel.app,restbackend.herokuapp.com,organizeseefrontend-git-versa-011530-jonathas-projects-1a4227bc.vercel.app/home', cast=Csv())
```

Por:

```python
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='127.0.0.1,localhost,organizesee.com.br,front-teal-beta-95.vercel.app,restbackend-dc8667cf0950.herokuapp.com,organizeseefrontend-git-versa-011530-jonathas-projects-1a4227bc.vercel.app', cast=Csv())
```

## 2. Atualizar CORS_ALLOWED_ORIGINS

Substitua:

```python
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,https://organizesee.com.br,https://front-teal-beta-95.vercel.app',
    cast=Csv()
)
```

Por:

```python
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,https://organizesee.com.br,https://www.organizesee.com.br,https://front-teal-beta-95.vercel.app',
    cast=Csv()
)
```

## 3. Adicionar Middleware de Logging (Recomendado)

Para debugar as requisições que estão chegando, adicione este middleware temporário:

```python
class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        print(f"🌐 REQUEST: {request.method} {request.get_full_path()}")
        print(f"📨 Origin: {request.META.get('HTTP_ORIGIN', 'No Origin')}")
        print(f"🎯 Host: {request.META.get('HTTP_HOST', 'No Host')}")
        
        response = self.get_response(request)
        return response
```

E adicione ao MIDDLEWARE:

```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'organizesee.middlewares.RequestLoggingMiddleware',  # ADICIONAR ESTA LINHA
    # ... resto dos middlewares
]
```

## 4. Verificar URLs do Backend

Certifique-se de que as rotas estão corretas no `urls.py`:

```python
# backend/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('organizesee.urls')),  # Todas as rotas da API
]
```

## 5. Variáveis de Ambiente no Heroku

Configure essas variáveis no Heroku (via dashboard ou CLI):

```bash
heroku config:set ALLOWED_HOSTS="127.0.0.1,localhost,organizesee.com.br,front-teal-beta-95.vercel.app,restbackend-dc8667cf0950.herokuapp.com,organizeseefrontend-git-versa-011530-jonathas-projects-1a4227bc.vercel.app" --app restbackend-dc8667cf0950

heroku config:set CORS_ALLOWED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,https://organizesee.com.br,https://www.organizesee.com.br,https://front-teal-beta-95.vercel.app" --app restbackend-dc8667cf0950
```

## 6. Restart do Heroku

Após fazer as mudanças:

```bash
heroku restart --app restbackend-dc8667cf0950
```
