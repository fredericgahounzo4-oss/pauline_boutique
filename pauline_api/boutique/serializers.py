from rest_framework import serializers
from .models import Categorie, Produit, ProduitImage, Utilisateur, Commande, CommandeItem


class CategorieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = ['id', 'nom', 'slug']


class ProduitSerializer(serializers.ModelSerializer):
    # Champs renommés pour correspondre exactement à la structure React
    id = serializers.IntegerField()
    name = serializers.CharField(source='nom')
    price = serializers.FloatField(source='prix')
    image = serializers.CharField(source='image_principale')
    rating = serializers.FloatField(source='note_moyenne')
    reviews = serializers.IntegerField(source='nombre_avis')
    category = serializers.CharField(source='categorie.nom')
    categorie_slug = serializers.CharField(source='categorie.slug')
    description = serializers.CharField()
    slides = serializers.SerializerMethodField()

    class Meta:
        model = Produit
        fields = ['id', 'name', 'price', 'image', 'rating', 'reviews',
                  'category', 'categorie_slug', 'description', 'stock',
                  'image_principale', 'nom', 'prix', 'note_moyenne',
                  'nombre_avis', 'actif', 'slides']

    def get_slides(self, obj):
        images = list(obj.images.values_list('chemin', flat=True))
        return images if images else [obj.image_principale]


class ProduitAdminSerializer(serializers.ModelSerializer):
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)
    prix = serializers.FloatField()
    note_moyenne = serializers.FloatField()

    class Meta:
        model = Produit
        fields = ['id', 'nom', 'description', 'prix', 'stock', 'categorie_id',
                  'categorie_nom', 'image_principale', 'note_moyenne',
                  'nombre_avis', 'actif', 'created_at']


class CommandeItemSerializer(serializers.ModelSerializer):
    sous_total = serializers.SerializerMethodField()

    class Meta:
        model = CommandeItem
        fields = ['id', 'produit_id', 'nom_produit', 'prix_unit', 'quantite', 'sous_total']

    def get_sous_total(self, obj):
        return float(obj.sous_total)


class CommandeSerializer(serializers.ModelSerializer):
    items = CommandeItemSerializer(many=True, read_only=True)
    client_nom = serializers.CharField(source='utilisateur.nom', read_only=True, default=None)
    client_email = serializers.CharField(source='utilisateur.email', read_only=True, default=None)
    nb_articles = serializers.SerializerMethodField()
    montant_total = serializers.FloatField()

    class Meta:
        model = Commande
        fields = ['id', 'numero_commande', 'statut', 'montant_total', 'frais_livraison',
                  'methode_paiement', 'operateur_mobile', 'transaction_id',
                  'adresse_livraison', 'client_nom', 'client_email',
                  'nb_articles', 'items', 'created_at']

    def get_nb_articles(self, obj):
        return obj.items.count()
