from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView, LoginView,
    ProduitListView, CategorieListView,
    CommandeCreateView,
    AdminStatsView,
    AdminProduitListView, AdminProduitAddView,
    AdminProduitEditView, AdminProduitDeleteView,
    AdminCommandeListView, AdminCommandeStatutView,
    CheckEmailView,
)

from .password_reset import (
    ForgotPasswordView,
    VerifyResetCodeView,
    ResetPasswordView,
)

urlpatterns = [

    # ───────────────── AUTH ─────────────────
    path('auth/register/', RegisterView.as_view()),
    path('auth/login/', LoginView.as_view()),
    path('auth/refresh/', TokenRefreshView.as_view()),
    path('auth/check-email/', CheckEmailView.as_view()),

    # Password reset
    path('auth/forgot-password/', ForgotPasswordView.as_view()),
    path('auth/verify-reset-code/', VerifyResetCodeView.as_view()),
    path('auth/reset-password/', ResetPasswordView.as_view()),


    # ───────────────── PRODUITS (PUBLIC) ─────────────────
    path('produits/', ProduitListView.as_view()),
    path('categories/', CategorieListView.as_view()),


    # ───────────────── COMMANDES ─────────────────
    path('commandes/', CommandeCreateView.as_view()),


    # ───────────────── ADMIN ─────────────────
    path('admin/stats/', AdminStatsView.as_view()),

    path('admin/produits/', AdminProduitListView.as_view()),
    path('admin/produits/add/', AdminProduitAddView.as_view()),
    path('admin/produits/edit/', AdminProduitEditView.as_view()),
    path('admin/produits/delete/', AdminProduitDeleteView.as_view()),

    path('admin/commandes/', AdminCommandeListView.as_view()),
    path('admin/commandes/statut/', AdminCommandeStatutView.as_view()),
]