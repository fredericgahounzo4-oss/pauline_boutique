"""
Vues Django REST — Pauline Boutique
"""

import uuid
import os
import time
import random
from datetime import date

from django.db import transaction
from django.db.models import Sum
from django.conf import settings

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


# ─── Helpers ─────────────────────────────────────────────

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "token": str(refresh.access_token),
        "refresh": str(refresh),
    }


def user_to_dict(user):
    return {
        "id": user.id,
        "nom": user.nom,
        "email": user.email,
        "role": user.role,
    }


# ─── AUTH ────────────────────────────────────────────────

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if not serializer.is_valid():
            errors = []
            for field_errors in serializer.errors.values():
                for e in field_errors:
                    errors.append(str(e))

            return Response(
                {"error": " ".join(errors)},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.save()
        tokens = get_tokens_for_user(user)

        return Response({
            "success": True,
            "message": "Compte créé avec succès !",
            "user": user_to_dict(user),
            **tokens,
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if not serializer.is_valid():
            errors = []
            for field_errors in serializer.errors.values():
                for e in field_errors:
                    errors.append(str(e))

            return Response(
                {"error": " ".join(errors)},
                status=status.HTTP_401_UNAUTHORIZED
            )

        user = serializer.validated_data["user"]
        tokens = get_tokens_for_user(user)

        return Response({
            "success": True,
            "user": user_to_dict(user),
            **tokens,
        })


# ─── PRODUITS PUBLIC ─────────────────────────────────────

class ProduitListView(APIView):
    def get(self, request):
        qs = Produit.objects.filter(actif=True).select_related("categorie")

        categorie = request.GET.get("categorie")
        search = request.GET.get("search")

        if categorie:
            qs = qs.filter(categorie__slug=categorie)

        if search:
            qs = qs.filter(nom__icontains=search)

        serializer = ProduitSerializer(qs, many=True)

        return Response({
            "success": True,
            "produits": serializer.data,
            "total": qs.count(),
        })


# ─── COMMANDES ───────────────────────────────────────────

class CommandeCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CommandeCreateSerializer(data=request.data)

        if not serializer.is_valid():
            errors = []
            for field_errors in serializer.errors.values():
                for e in field_errors:
                    errors.append(str(e))

            return Response({"error": " ".join(errors)}, status=400)

        data = serializer.validated_data

        if not data.get("utilisateur_id"):
            return Response({"error": "Utilisateur requis"}, status=400)

        numero = f"CMD-{date.today().year}-{uuid.uuid4().hex[:8].upper()}"

        try:
            with transaction.atomic():
                commande = Commande.objects.create(
                    utilisateur_id=data["utilisateur_id"],
                    numero_commande=numero,
                    montant_total=data["montant_total"],
                    methode_paiement=data["methode_paiement"],
                    operateur_mobile=data.get("operateur_mobile"),
                    transaction_id=data.get("transaction_id"),
                    adresse_livraison=data.get("adresse_livraison", {}),
                    statut="payee",
                )

                for item in data["items"]:
                    CommandeItem.objects.create(
                        commande=commande,
                        produit_id=item.get("id"),
                        nom_produit=item.get("name", "Produit"),
                        prix_unit=float(item.get("price", 0) or 0),
                        quantite=int(item.get("quantity", 1) or 1),
                    )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=500
            )

        return Response({
            "success": True,
            "commande_id": commande.id,
            "numero_commande": numero,
        })


# ─── ADMIN STATS ─────────────────────────────────────────

class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        nb_produits = Produit.objects.filter(actif=True).count()
        nb_clients = Utilisateur.objects.filter(role="client").count()
        nb_commandes = Commande.objects.count()

        ca = Commande.objects.exclude(statut="annulee").aggregate(
            total=Sum("montant_total")
        )["total"] or 0

        dernieres = Commande.objects.order_by("-created_at")[:5]

        return Response({
            "success": True,
            "nb_produits": nb_produits,
            "nb_clients": nb_clients,
            "nb_commandes": nb_commandes,
            "chiffre_affaires": float(ca),
            "dernieres_commandes": [
                {
                    "id": c.id,
                    "numero_commande": c.numero_commande,
                    "statut": c.statut,
                    "montant_total": float(c.montant_total),
                }
                for c in dernieres
            ],
        })


# ─── PRODUITS ADMIN ──────────────────────────────────────

class AdminProduitAddView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        try:
            nom = request.data.get("nom", "").strip()
            description = request.data.get("description", "").strip()
            prix = float(request.data.get("prix", 0) or 0)
            stock = int(request.data.get("stock", 0) or 0)
            categorie_id = int(request.data.get("categorie_id", 0) or 0)
        except ValueError:
            return Response({"error": "Données invalides"}, status=400)

        if not nom or prix <= 0 or not categorie_id:
            return Response({"error": "Nom, prix et catégorie requis"}, status=400)

        try:
            categorie = Categorie.objects.get(id=categorie_id)
        except Categorie.DoesNotExist:
            return Response({"error": "Catégorie invalide"}, status=400)

        image_path = None
        image_file = request.FILES.get("image")

        if image_file:
            ext = os.path.splitext(image_file.name)[1].lower()
            allowed = [".jpg", ".jpeg", ".png", ".webp"]

            if ext in allowed:
                filename = f"prod_{int(time.time())}_{random.randint(1000,9999)}{ext}"
                path = os.path.join(settings.MEDIA_ROOT, "products/uploads")
                os.makedirs(path, exist_ok=True)

                full_path = os.path.join(path, filename)

                with open(full_path, "wb") as f:
                    for chunk in image_file.chunks():
                        f.write(chunk)

                image_path = f"/media/products/uploads/{filename}"

        produit = Produit.objects.create(
            nom=nom,
            description=description,
            prix=prix,
            stock=stock,
            categorie=categorie,
            image_principale=image_path,
            actif=True,
        )

        return Response({
            "success": True,
            "id": produit.id,
            "image": image_path,
        }, status=201)


class AdminProduitEditView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        try:
            produit = Produit.objects.get(id=int(request.data.get("id", 0)))
        except:
            return Response({"error": "Produit introuvable"}, status=404)

        produit.nom = request.data.get("nom", produit.nom).strip()
        produit.description = request.data.get("description", produit.description).strip()

        try:
            produit.prix = float(request.data.get("prix", produit.prix))
            produit.stock = int(request.data.get("stock", produit.stock))
        except ValueError:
            return Response({"error": "Prix ou stock invalide"}, status=400)

        produit.actif = str(request.data.get("actif", produit.actif)).lower() in ["1", "true", "yes"]

        image_file = request.FILES.get("image")
        if image_file:
            ext = os.path.splitext(image_file.name)[1].lower()
            allowed = [".jpg", ".jpeg", ".png", ".webp"]

            if ext in allowed:
                filename = f"prod_{int(time.time())}_{random.randint(1000,9999)}{ext}"
                path = os.path.join(settings.MEDIA_ROOT, "products/uploads")
                os.makedirs(path, exist_ok=True)

                full_path = os.path.join(path, filename)

                with open(full_path, "wb") as f:
                    for chunk in image_file.chunks():
                        f.write(chunk)

                produit.image_principale = f"/media/products/uploads/{filename}"

        produit.save()

        return Response({"success": True})


class AdminProduitDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request):
        try:
            produit = Produit.objects.get(id=int(request.data.get("id", 0)))
        except:
            return Response({"error": "Produit introuvable"}, status=404)

        produit.actif = False
        produit.save()

        return Response({"success": True})


# ─── CATEGORIES ──────────────────────────────────────────

class CategorieListView(APIView):
    def get(self, request):
        cats = Categorie.objects.values("id", "nom", "slug")
        return Response({"success": True, "categories": list(cats)})


# ─── EMAIL CHECK ─────────────────────────────────────────

class CheckEmailView(APIView):
    def post(self, request):
        email = request.data.get("email", "").strip().lower()

        if not email or "@" not in email:
            return Response({"exists": False})

        try:
            user = Utilisateur.objects.get(email=email)
            return Response({"exists": True, "nom": user.nom})
        except Utilisateur.DoesNotExist:
            return Response({"exists": False})