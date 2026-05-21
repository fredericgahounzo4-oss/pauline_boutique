"""
Vues Django REST — Pauline Boutique (VERSION STABLE)
"""
import uuid
from datetime import date

from django.db import transaction
from django.db.models import Count, Sum, Q
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Utilisateur, Produit, Categorie, Commande, CommandeItem
from .serializers import (
    RegisterSerializer, LoginSerializer,
    ProduitSerializer, ProduitAdminSerializer,
    CommandeCreateSerializer, CommandeAdminSerializer,
)
from .permissions import IsAdminRole


# ───────────────────────── HELPERS ─────────────────────────
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'token': str(refresh.access_token),
        'refresh': str(refresh),
    }


def user_to_dict(user):
    return {
        'id': user.id,
        'nom': user.nom,
        'email': user.email,
        'role': user.role,
    }


# ───────────────────────── PRODUITS (FIX IMPORTANT) ─────────────────────────
class ProduitListView(APIView):
    """API Produits (version SAFE - évite crash Render)"""

    def get(self, request):
        qs = Produit.objects.all()

        categorie = request.GET.get('categorie')
        search = request.GET.get('search')

        # filtre actif seulement si champ existe
        if hasattr(Produit, 'actif'):
            qs = qs.filter(actif=True)

        if categorie:
            qs = qs.filter(categorie__slug=categorie)

        if search:
            qs = qs.filter(
                Q(nom__icontains=search) |
                Q(description__icontains=search)
            )

        qs = qs.order_by('id')

        serializer = ProduitSerializer(qs, many=True)

        return Response({
            'success': True,
            'produits': serializer.data,
            'total': qs.count(),
        })


# ───────────────────────── AUTH ─────────────────────────
class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            errors = []
            for field_errors in serializer.errors.values():
                errors.extend(field_errors)
            return Response({'error': ' '.join(str(e) for e in errors)}, status=400)

        user = serializer.save()
        tokens = get_tokens_for_user(user)

        return Response({
            'success': True,
            'user': user_to_dict(user),
            **tokens,
        }, status=201)


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            errors = []
            for field_errors in serializer.errors.values():
                errors.extend(field_errors)
            return Response({'error': ' '.join(str(e) for e in errors)}, status=401)

        user = serializer.validated_data['user']
        tokens = get_tokens_for_user(user)

        return Response({
            'success': True,
            'user': user_to_dict(user),
            **tokens,
        })


# ───────────────────────── COMMANDES ─────────────────────────
class CommandeCreateView(APIView):
    def post(self, request):
        serializer = CommandeCreateSerializer(data=request.data)
        if not serializer.is_valid():
            errors = []
            for field_errors in serializer.errors.values():
                errors.extend(field_errors)
            return Response({'error': ' '.join(str(e) for e in errors)}, status=400)

        data = serializer.validated_data

        numero = f"CMD-{date.today().year}-{uuid.uuid4().hex[:8].upper()}"

        try:
            with transaction.atomic():
                commande = Commande.objects.create(
                    utilisateur_id=data.get('utilisateur_id'),
                    numero_commande=numero,
                    montant_total=data['montant_total'],
                    methode_paiement=data['methode_paiement'],
                    operateur_mobile=data.get('operateur_mobile'),
                    transaction_id=data.get('transaction_id'),
                    adresse_livraison=data.get('adresse_livraison', {}),
                    statut='payee',
                )

                for item in data['items']:
                    CommandeItem.objects.create(
                        commande=commande,
                        produit_id=item.get('id'),
                        nom_produit=item.get('name', 'Produit'),
                        prix_unit=float(item.get('price', 0)),
                        quantite=int(item.get('quantity', 1)),
                    )

        except Exception as e:
            return Response({'error': str(e)}, status=500)

        return Response({
            'success': True,
            'commande_id': commande.id,
            'numero_commande': numero,
        })


# ───────────────────────── ADMIN (SIMPLIFIÉ STABLE) ─────────────────────────
class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        nb_produits = Produit.objects.count()
        nb_clients = Utilisateur.objects.filter(role='client').count()
        nb_commandes = Commande.objects.count()

        ca = Commande.objects.exclude(statut='annulee').aggregate(
            total=Sum('montant_total')
        )['total'] or 0

        return Response({
            'success': True,
            'nb_produits': nb_produits,
            'nb_clients': nb_clients,
            'nb_commandes': nb_commandes,
            'chiffre_affaires': float(ca),
        })


class CategorieListView(APIView):
    def get(self, request):
        cats = Categorie.objects.values('id', 'nom', 'slug')
        return Response({'success': True, 'categories': list(cats)})