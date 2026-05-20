"""
Routes API — Pauline Boutique
Correspondance exacte avec les fichiers PHP :

  PHP                               Django
  ───────────────────────────────── ──────────────────────────────────
  /api/auth/login.php               POST /api/auth/login/
  /api/auth/register.php            POST /api/auth/register/
  /api/produits/list.php            GET  /api/produits/
  /api/commandes/create.php         POST /api/commandes/
  /api/admin/stats.php              GET  /api/admin/stats/
  /api/admin/produits_list.php      GET  /api/admin/produits/
  /api/admin/produits_add.php       POST /api/admin/produits/add/
  /api/admin/produits_edit.php      POST /api/admin/produits/edit/
  /api/admin/produits_delete.php    POST /api/admin/produits/delete/
  /api/admin/commandes_list.php     GET  /api/admin/commandes/
  /api/admin/commande_statut.php    POST /api/admin/commandes/statut/
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView, LoginView,
    ProduitListView, CategorieListView,
    CommandeCreateView,
    AdminStatsView,
    AdminProduitListView, AdminProduitAddView, AdminProduitEditView, AdminProduitDeleteView,
    AdminCommandeListView, AdminCommandeStatutView,
    CheckEmailView,
)

# ── Password Reset ──────────────────────────────────────────────────────
from .password_reset import ForgotPasswordView, VerifyResetCodeView, ResetPasswordView


urlpatterns = [
    # ── Auth ────────────────────────────────────────────────────────────────
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('auth/check-email/', CheckEmailView.as_view(), name='auth-check-email'),

    # ── Password Reset ─────────────────────────────────────────────────────
    path('auth/forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('auth/verify-reset-code/', VerifyResetCodeView.as_view(), name='verify-reset-code'),
    path('auth/reset-password/', ResetPasswordView.as_view(), name='reset-password'),

    # ── Produits & catégories (public) ──────────────────────────────────────
    path('produits/', ProduitListView.as_view(), name='produits-list'),
    path('categories/', CategorieListView.as_view(), name='categories-list'),

    # ── Commandes ───────────────────────────────────────────────────────────
    path('commandes/', CommandeCreateView.as_view(), name='commandes-create'),

    # ── Admin ────────────────────────────────────────────────────────────────
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('admin/produits/', AdminProduitListView.as_view(), name='admin-produits-list'),
    path('admin/produits/add/', AdminProduitAddView.as_view(), name='admin-produits-add'),
    path('admin/produits/edit/', AdminProduitEditView.as_view(), name='admin-produits-edit'),
    path('admin/produits/delete/', AdminProduitDeleteView.as_view(), name='admin-produits-delete'),
    path('admin/commandes/', AdminCommandeListView.as_view(), name='admin-commandes-list'),
    path('admin/commandes/statut/', AdminCommandeStatutView.as_view(), name='admin-commandes-statut'),
]