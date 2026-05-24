from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/login',                views.login,                 name='login'),
    path('auth/register',             views.register,              name='register'),
    path('auth/check-email',          views.check_email,           name='check-email'),
    path('auth/reset-password',       views.reset_password,        name='reset-password'),
    path('auth/forgot-password',      views.forgot_password,       name='forgot-password'),
    path('auth/verify-reset-token',   views.verify_reset_token,    name='verify-reset-token'),
    path('auth/reset-password-token', views.reset_password_token,  name='reset-password-token'),

    # Produits publics
    path('produits/list',        views.produits_list,          name='produits-list'),

    # Commandes
    path('commandes/create',     views.commandes_create,       name='commandes-create'),

    # Catégories
    path('categories',           views.categories_list,        name='categories'),

    # Admin
    path('admin/stats',           views.admin_stats,            name='admin-stats'),
    path('admin/commandes',       views.admin_commandes_list,   name='admin-commandes'),
    path('admin/commande-statut', views.admin_commande_statut,  name='admin-commande-statut'),
    path('admin/produits',        views.admin_produits_list,    name='admin-produits'),
    path('admin/produits/add',    views.admin_produits_add,     name='admin-produits-add'),
    path('admin/produits/edit',   views.admin_produits_edit,    name='admin-produits-edit'),
    path('admin/produits/delete', views.admin_produits_delete,  name='admin-produits-delete'),
]
