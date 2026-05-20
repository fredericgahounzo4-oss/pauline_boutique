"""
Interface d'administration Django — Pauline Boutique
Accessible via /django-admin/ (en plus des pages admin React)
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    Utilisateur, Categorie, Produit, ProduitImage,
    Commande, CommandeItem, Wishlist, Avis
)


@admin.register(Utilisateur)
class UtilisateurAdmin(BaseUserAdmin):
    list_display   = ('email', 'nom', 'role', 'actif', 'created_at')
    list_filter    = ('role', 'actif')
    search_fields  = ('email', 'nom')
    ordering       = ('-created_at',)

    fieldsets = (
        (None,            {'fields': ('email', 'password')}),
        ('Informations',  {'fields': ('nom', 'telephone', 'role', 'actif')}),
        ('Permissions',   {'fields': ('is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields':  ('email', 'nom', 'password1', 'password2', 'role'),
        }),
    )


class ProduitImageInline(admin.TabularInline):
    model  = ProduitImage
    extra  = 1
    fields = ('chemin', 'ordre')


@admin.register(Produit)
class ProduitAdmin(admin.ModelAdmin):
    list_display   = ('nom', 'categorie', 'prix', 'stock', 'note_moyenne', 'actif')
    list_filter    = ('categorie', 'actif')
    search_fields  = ('nom', 'description')
    list_editable  = ('actif', 'prix', 'stock')
    inlines        = [ProduitImageInline]
    ordering       = ('-created_at',)


@admin.register(Categorie)
class CategorieAdmin(admin.ModelAdmin):
    list_display = ('nom', 'slug', 'created_at')
    prepopulated_fields = {'slug': ('nom',)}


class CommandeItemInline(admin.TabularInline):
    model       = CommandeItem
    extra       = 0
    readonly_fields = ('sous_total',)


@admin.register(Commande)
class CommandeAdmin(admin.ModelAdmin):
    list_display   = ('numero_commande', 'statut', 'montant_total', 'methode_paiement', 'created_at')
    list_filter    = ('statut', 'methode_paiement')
    search_fields  = ('numero_commande', 'utilisateur__nom', 'utilisateur__email')
    list_editable  = ('statut',)
    inlines        = [CommandeItemInline]
    ordering       = ('-created_at',)


@admin.register(Avis)
class AvisAdmin(admin.ModelAdmin):
    list_display = ('produit', 'utilisateur', 'note', 'valide', 'created_at')
    list_filter  = ('valide', 'note')
    list_editable = ('valide',)


admin.site.site_header = "Pauline Boutique — Administration"
admin.site.site_title  = "Pauline Admin"
admin.site.index_title = "Tableau de bord"
