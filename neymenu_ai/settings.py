import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env — must come before any os.environ.get() call
load_dotenv(BASE_DIR / '.env')

# SECURITY — all values must come from environment in production
SECRET_KEY = os.environ.get('SECRET_KEY', 'CHANGE-ME-IN-PRODUCTION')
DEBUG = os.environ.get('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = [h.strip() for h in os.environ.get('ALLOWED_HOSTS', '127.0.0.1,localhost').split(',') if h.strip()]
CSRF_TRUSTED_ORIGINS = [o.strip() for o in os.environ.get('CSRF_TRUSTED_ORIGINS', 'http://127.0.0.1:8000').split(',') if o.strip()]

# Secure cookie settings — automatically enabled when DEBUG=False
if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_SSL_REDIRECT = os.environ.get('SECURE_SSL_REDIRECT', 'False') == 'True'


# Application definition

INSTALLED_APPS = [
    # 'daphne',  # Comment out for local dev with runserver; use daphne separately in production
    'modeltranslation',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'corsheaders',
    'channels',
    
    # Local apps
    'accounts',
    'restaurants',
    'menu',
    'tables',
    'orders',
    'payments',
    'analytics',
    'customers',
    'loyalty',
    'campaigns',
    'reviews',
    'inventory',
    'expenses',
    'ai_engine',
    'subscriptions',
    'support',
    'core',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.locale.LocaleMiddleware', # i18n
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'neymenu_ai.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'neymenu_ai.wsgi.application'
ASGI_APPLICATION = 'neymenu_ai.asgi.application'


# Database
# Uses PostgreSQL when DB_HOST is set in .env, SQLite otherwise (local dev without PG)
_db_host = os.environ.get('DB_HOST', '')
if _db_host:
    DATABASES = {
        'default': {
            'ENGINE': os.environ.get('DB_ENGINE', 'django.db.backends.postgresql'),
            'NAME': os.environ.get('DB_NAME', 'neymenu_db'),
            'USER': os.environ.get('DB_USER', 'postgres'),
            'PASSWORD': os.environ.get('DB_PASSWORD', 'postgres'),
            'HOST': _db_host,
            'PORT': os.environ.get('DB_PORT', '5432'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Redis Channel Layer
# Falls back to InMemoryChannelLayer when REDIS_URL is not set (no real-time in dev without Redis)
_redis_url = os.environ.get('REDIS_URL', '')
if _redis_url:
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels_redis.core.RedisChannelLayer",
            "CONFIG": {
                "hosts": [_redis_url],
            },
        },
    }
else:
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels.layers.InMemoryChannelLayer",
        },
    }

# Custom User Model
AUTH_USER_MODEL = 'accounts.User'


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
LANGUAGE_CODE = 'tr'

from django.utils.translation import gettext_lazy as _
LANGUAGES = [
    ('az', _('Azerbaijani')),
    ('tr', _('Turkish')),
    ('en', _('English')),
    ('ru', _('Russian')),
    ('ar', _('Arabic')),
]

LOCALE_PATHS = [
    BASE_DIR / 'locale',
]

TIME_ZONE = 'Europe/Istanbul'

USE_I18N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'


# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Auth redirects
LOGIN_URL = 'login'
LOGIN_REDIRECT_URL = 'restaurant_dashboard'
LOGOUT_REDIRECT_URL = 'login'

# CORS — restrict in production via CORS_ALLOWED_ORIGINS env var
_cors_origins = os.environ.get('CORS_ALLOWED_ORIGINS', '')
if _cors_origins:
    CORS_ALLOWED_ORIGINS = [o.strip() for o in _cors_origins.split(',') if o.strip()]
else:
    CORS_ALLOW_ALL_ORIGINS = DEBUG  # permissive only in dev

# AI Provider (see ai_engine/providers.py)
# Set AI_API_KEY in .env to enable real AI. Leave blank to use MockAIProvider.
AI_API_KEY = os.environ.get('AI_API_KEY', '')
if AI_API_KEY:
    os.environ.setdefault('AI_API_KEY', AI_API_KEY)

# File upload limits
DATA_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024  # 5 MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024
