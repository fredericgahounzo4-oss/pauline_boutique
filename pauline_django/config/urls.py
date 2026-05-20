"""
URLs principales — équivalent du .htaccess + routage PHP
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Interface d'administration Django (conservée comme demandé)
    path('django-admin/', admin.site.urls),

    # API — correspond exactement aux routes PHP :
    # /api/auth/login.php        → /api/auth/login/
    # /api/auth/register.php     → /api/auth/register/
    # /api/produits/list.php     → /api/produits/
    # /api/commandes/create.php  → /api/commandes/
    # /api/admin/...             → /api/admin/...
    path('api/', include('boutique.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
