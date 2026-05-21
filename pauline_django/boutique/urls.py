from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView, LoginView,
    ProduitListView, CategorieListView,
    CommandeCreateView,
    AdminStatsView,
    CheckEmailView,
)

from .password_reset import (
    ForgotPasswordView,
    VerifyResetCodeView,
    ResetPasswordView
)

urlpatterns = [
    # ── AUTH ─────────────────────────────
    path('auth/register/', RegisterView.as_view()),
    path('auth/login/', LoginView.as_view()),
    path('auth/refresh/', TokenRefreshView.as_view()),
    path('auth/check-email/', CheckEmailView.as_view()),

    # ── PASSWORD RESET ───────────────────
    path('auth/forgot-password/', ForgotPasswordView.as_view()),
    path('auth/verify-reset-code/', VerifyResetCodeView.as_view()),
    path('auth/reset-password/', ResetPasswordView.as_view()),

    # ── PRODUITS ─────────────────────────
    path('produits/', ProduitListView.as_view()),
    path('categories/', CategorieListView.as_view()),

    # ── COMMANDES ────────────────────────
    path('commandes/', CommandeCreateView.as_view()),

    # ── ADMIN (SAFE VERSION) ─────────────
    path('admin/stats/', AdminStatsView.as_view()),
]