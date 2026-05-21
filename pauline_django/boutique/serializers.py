"""
Sérialiseurs DRF — Pauline Boutique
Formatent les données exactement comme les réponses JSON PHP
"""
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Utilisateur, Categorie, Produit, ProduitImage, Commande, CommandeItem


# ─── Auth ─────────────────────────────────────────────────────────────────────
class RegisterSerializer(serializers.Serializer):
    """Équivalent de auth/register.php"""
    nom      = serializers.CharField(max_length=150)
    email    = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)

    def validate_email(self, value):
        if Utilisateur.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cet e-mail est déjà utilisé. Connectez-vous.")
        return value

    def create(self, validated_data):
        user = Utilisateur.objects.create_user(
            email=validated_data['email'],
            nom=validated_data['nom'],
            password=validated_data['password'],
        )
        return user


class LoginSerializer(serializers.Serializer):
    """Équivalent de auth/login.php"""
    email    = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError("E-mail ou mot de passe incorrect.")
        if not user.actif:
            raise serializers.ValidationError("Compte désactivé.")
        data['user'] = user
        return data


# ─── Produits ─────────────────────────────────────────────────────────────────
class ProduitSerializer(serializers.ModelSerializer):
    """
    Équivalent de produits/list.php
    Renomme les champs exactement comme le PHP le faisait pour React
    """
    name          = serializers.CharField(source='nom')
    price         = serializers.DecimalField(source='prix', max_digits=10, decimal_places=2)
    image         = serializers.CharField(source='image_principale')
    rating        = serializers.DecimalField(source='note_moyenne', max_digits=3, decimal_places=2)
    reviews       = serializers.IntegerField(source='nombre_avis')
    category      = serializers.CharField(source='categorie.nom')
    category_slug = serializers.CharField(source='categorie.slug')
    slides        = serializers.SerializerMethodField()

    class Meta:
        model  = Produit
        fields = [
            'id', 'name', 'price', 'image', 'rating', 'reviews',
            'category', 'category_slug', 'description', 'stock', 'actif', 'slides'
        ]

    def get_slides(self, obj):
        images = obj.images.values_list('chemin', flat=True)
        return list(images) if images else [obj.image_principale]


class ProduitAdminSerializer(serializers.ModelSerializer):
    """Pour l'admin — inclut tous les champs (équivalent de admin/produits_list.php)"""
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)
    prix          = serializers.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        model  = Produit
        fields = [
            'id', 'nom', 'description', 'prix', 'stock',
            'categorie_id', 'categorie_nom', 'image_principale',
            'note_moyenne', 'nombre_avis', 'actif', 'created_at', 'updated_at'
        ]


# ─── Commandes ────────────────────────────────────────────────────────────────
class CommandeItemSerializer(serializers.ModelSerializer):
    sous_total = serializers.ReadOnlyField()

    class Meta:
        model  = CommandeItem
        fields = ['id', 'produit_id', 'nom_produit', 'prix_unit', 'quantite', 'sous_total']


class CommandeCreateSerializer(serializers.Serializer):
    """Équivalent de commandes/create.php"""
    items             = serializers.ListField()
    montant_total     = serializers.DecimalField(max_digits=10, decimal_places=2)
    methode_paiement  = serializers.ChoiceField(choices=['mobile_money', 'carte', 'livraison'])
    operateur_mobile  = serializers.CharField(required=False, allow_blank=True)
    transaction_id    = serializers.CharField(required=False, allow_blank=True)
    adresse_livraison = serializers.DictField(required=False)
    utilisateur_id    = serializers.IntegerField(required=False, allow_null=True)

    def validate(self, data):
        if not data.get('items'):
            raise serializers.ValidationError("La commande doit contenir au moins un article.")
        if float(data.get('montant_total', 0)) <= 0:
            raise serializers.ValidationError("Le montant total doit être positif.")
        return data


class CommandeAdminSerializer(serializers.ModelSerializer):
    """Pour admin/commandes_list.php"""
    client_nom   = serializers.CharField(source='utilisateur.nom', default=None)
    client_email = serializers.CharField(source='utilisateur.email', default=None)
    items        = CommandeItemSerializer(many=True, read_only=True)
    nb_articles  = serializers.SerializerMethodField()

    class Meta:
        model  = Commande
        fields = [
            'id', 'numero_commande', 'statut', 'montant_total', 'frais_livraison',
            'methode_paiement', 'operateur_mobile', 'adresse_livraison',
            'note_client', 'created_at', 'updated_at',
            'client_nom', 'client_email', 'items', 'nb_articles'
        ]

    def get_nb_articles(self, obj):
        return obj.items.count()
