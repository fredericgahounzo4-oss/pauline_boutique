"""
Password Reset — Pauline Boutique (EmailJS version)
"""

import random
import string
import secrets
from datetime import timedelta

from django.utils import timezone
from django.db import models

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Utilisateur


# ─── MODELE ────────────────────────────────────────────────────────────────

class PasswordResetCode(models.Model):
    email = models.EmailField()
    code = models.CharField(max_length=6)
    token = models.CharField(max_length=64, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)

    class Meta:
        db_table = 'password_reset_codes'

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=15)


# ─── HELPERS ────────────────────────────────────────────────────────────────

def _generate_code():
    return ''.join(random.choices(string.digits, k=6))


# ─── VUE FORGOT PASSWORD ─────────────────────────────────────────────────────

class ForgotPasswordView(APIView):
    def post(self, request):
        email = request.data.get('email', '').strip().lower()

        if not email or '@' not in email:
            return Response(
                {'success': False, 'error': 'Email invalide'},
                status=status.HTTP_400_BAD_REQUEST
            )

        PasswordResetCode.objects.filter(email=email, used=False).delete()

        try:
            user = Utilisateur.objects.get(email=email)
        except Utilisateur.DoesNotExist:
            return Response({'success': True})

        code = _generate_code()
        PasswordResetCode.objects.create(email=email, code=code)

        # 🔥 IMPORTANT : EmailJS s’occupe de l’envoi
        return Response({
            'success': True,
            'code': code,
            'name': user.nom,
            'email': email
        })


class VerifyResetCodeView(APIView):
    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        code = request.data.get('code', '').strip()

        try:
            reset = PasswordResetCode.objects.filter(
                email=email,
                code=code,
                used=False
            ).latest('created_at')
        except PasswordResetCode.DoesNotExist:
            return Response({'success': False, 'error': 'Code invalide'})

        if reset.is_expired():
            return Response({'success': False, 'error': 'Code expiré'})

        token = secrets.token_urlsafe(48)
        reset.token = token
        reset.save()

        return Response({'success': True, 'token': token})


class ResetPasswordView(APIView):
    def post(self, request):
        token = request.data.get('token', '').strip()
        password = request.data.get('password', '')
        confirm = request.data.get('confirm', '')

        if password != confirm:
            return Response({'success': False, 'error': 'Mots de passe différents'})

        try:
            reset = PasswordResetCode.objects.filter(
                token=token,
                used=False
            ).latest('created_at')
        except PasswordResetCode.DoesNotExist:
            return Response({'success': False, 'error': 'Token invalide'})

        if reset.is_expired():
            return Response({'success': False, 'error': 'Session expirée'})

        try:
            user = Utilisateur.objects.get(email=reset.email)
        except Utilisateur.DoesNotExist:
            return Response({'success': False, 'error': 'Utilisateur introuvable'})

        user.set_password(password)
        user.save()

        reset.used = True
        reset.save()

        return Response({'success': True})