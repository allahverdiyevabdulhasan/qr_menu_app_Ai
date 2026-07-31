import os
import shutil
import re

# Paths
LEGACY_DIR = r"C:\Users\amira\OneDrive - Yalova Üniversitesi\Desktop\Startup project\Qr_menu APP"
NEW_BACKEND_DIR = os.path.join(LEGACY_DIR, "QR_", "backend")

# Exclude directories
EXCLUDE_DIRS = ['venv', 'QR_', 'static', 'templates', 'media', 'neymenu_ai', 'scratch', 'locale', '.vscode', 'backend', '__pycache__']

def find_apps():
    apps = []
    for item in os.listdir(LEGACY_DIR):
        item_path = os.path.join(LEGACY_DIR, item)
        if os.path.isdir(item_path) and item not in EXCLUDE_DIRS:
            if os.path.exists(os.path.join(item_path, "models.py")):
                apps.append(item)
    return apps

def extract_model_names(models_content):
    valid_models = []
    for line in models_content.split('\n'):
        match = re.match(r"^class\s+([A-Za-z0-9_]+)\s*\((.*)\):", line.strip())
        if match:
            bases = match.group(2)
            if 'models.Model' in bases or 'AbstractUser' in bases or 'Model' in bases:
                valid_models.append(match.group(1))
    return valid_models

def generate_serializers(models, app_name):
    lines = ["from rest_framework import serializers", f"from .models import {', '.join(models)}", ""]
    for m in models:
        lines.append(f"class {m}Serializer(serializers.ModelSerializer):")
        lines.append(f"    class Meta:")
        lines.append(f"        model = {m}")
        lines.append(f"        fields = '__all__'")
        lines.append("")
    return "\n".join(lines)

def generate_views(models, app_name):
    lines = ["from rest_framework import viewsets", f"from .models import {', '.join(models)}", f"from .serializers import {', '.join([m + 'Serializer' for m in models])}", ""]
    for m in models:
        lines.append(f"class {m}ViewSet(viewsets.ModelViewSet):")
        lines.append(f"    queryset = {m}.objects.all()")
        lines.append(f"    serializer_class = {m}Serializer")
        lines.append("")
    return "\n".join(lines)

def generate_urls(models, app_name):
    lines = ["from django.urls import path, include", "from rest_framework.routers import DefaultRouter", f"from .views import {', '.join([m + 'ViewSet' for m in models])}", ""]
    lines.append("router = DefaultRouter()")
    for m in models:
        lines.append(f"router.register(r'{m.lower()}', {m}ViewSet)")
    lines.append("")
    lines.append("urlpatterns = [")
    lines.append("    path('', include(router.urls)),")
    lines.append("]")
    return "\n".join(lines)

def generate_apps_py(app_name):
    return f"""from django.apps import AppConfig

class {app_name.capitalize()}Config(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = '{app_name}'
"""

def main():
    apps = find_apps()
    print(f"Found {len(apps)} legacy apps: {apps}")
    
    for app in apps:
        old_app_dir = os.path.join(LEGACY_DIR, app)
        new_app_dir = os.path.join(NEW_BACKEND_DIR, app)
        
        if not os.path.exists(new_app_dir):
            os.makedirs(new_app_dir)
            
        shutil.copy2(os.path.join(old_app_dir, "models.py"), os.path.join(new_app_dir, "models.py"))
        
        if os.path.exists(os.path.join(old_app_dir, "admin.py")):
            shutil.copy2(os.path.join(old_app_dir, "admin.py"), os.path.join(new_app_dir, "admin.py"))
            
        open(os.path.join(new_app_dir, "__init__.py"), "w").close()
        
        with open(os.path.join(new_app_dir, "apps.py"), "w", encoding="utf-8") as f:
            f.write(generate_apps_py(app))
            
        with open(os.path.join(new_app_dir, "models.py"), "r", encoding="utf-8") as f:
            models_content = f.read()
            
        models = extract_model_names(models_content)
        print(f"App '{app}' has models: {models}")
        
        if models:
            with open(os.path.join(new_app_dir, "serializers.py"), "w", encoding="utf-8") as f:
                f.write(generate_serializers(models, app))
                
            with open(os.path.join(new_app_dir, "views.py"), "w", encoding="utf-8") as f:
                f.write(generate_views(models, app))
                
            with open(os.path.join(new_app_dir, "urls.py"), "w", encoding="utf-8") as f:
                f.write(generate_urls(models, app))
        else:
            print(f"No valid models found for {app}")

if __name__ == "__main__":
    main()
