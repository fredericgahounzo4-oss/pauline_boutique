from django.db import models


class Categorie(models.Model):
    nom = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categories'

    def __str__(self):
        return self.nom


class Produit(models.Model):
    nom = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    prix = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    categorie = models.ForeignKey(Categorie, on_delete=models.RESTRICT, db_column='categorie_id')
    image_principale = models.CharField(max_length=300, blank=True, null=True)
    note_moyenne = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    nombre_avis = models.PositiveIntegerField(default=0)
    actif = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'produits'

    def __str__(self):
        return self.nom


class ProduitImage(models.Model):
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name='images', db_column='produit_id')
    chemin = models.CharField(max_length=300)
    ordre = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = 'produit_images'
        ordering = ['ordre']


class Utilisateur(models.Model):
    ROLE_CHOICES = [('client', 'Client'), ('admin', 'Admin')]
    nom = models.CharField(max_length=150)
    email = models.EmailField(max_length=255, unique=True)
    mot_de_passe = models.CharField(max_length=255)
    telephone = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='client')
    actif = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'utilisateurs'

    def __str__(self):
        return self.email


class PasswordResetToken(models.Model):
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name='reset_tokens')
    token = models.CharField(max_length=64, unique=True)
    expire_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'password_reset_tokens'

    def is_valid(self):
        from django.utils import timezone
        return not self.used and self.expire_at > timezone.now()


class Avis(models.Model):
    produit     = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name='avis', db_column='produit_id')
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name='avis', db_column='utilisateur_id')
    note        = models.PositiveSmallIntegerField()  # 1 à 5
    commentaire = models.TextField(blank=True, null=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'avis'
        unique_together = ('produit', 'utilisateur')  # 1 avis par utilisateur par produit

    def __str__(self):
        return f"{self.utilisateur.nom} - {self.produit.nom} - {self.note}★"


class Commande(models.Model):
    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('payee', 'Payée'),
        ('en_cours', 'En cours'),
        ('livree', 'Livrée'),
        ('annulee', 'Annulée'),
    ]
    METHODE_CHOICES = [
        ('mobile_money', 'Mobile Money'),
        ('carte', 'Carte'),
        ('livraison', 'Livraison'),
    ]

    utilisateur = models.ForeignKey(
        Utilisateur, on_delete=models.SET_NULL, null=True, blank=True,
        db_column='utilisateur_id'
    )
    numero_commande = models.CharField(max_length=50, unique=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_attente')
    montant_total = models.DecimalField(max_digits=10, decimal_places=2)
    frais_livraison = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    methode_paiement = models.CharField(max_length=20, choices=METHODE_CHOICES)
    operateur_mobile = models.CharField(max_length=50, blank=True, null=True)
    transaction_id = models.CharField(max_length=200, blank=True, null=True)
    adresse_livraison = models.JSONField(null=True, blank=True)
    note_client = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'commandes'

    def __str__(self):
        return self.numero_commande


class CommandeItem(models.Model):
    commande = models.ForeignKey(Commande, on_delete=models.CASCADE, related_name='items', db_column='commande_id')
    produit = models.ForeignKey(Produit, on_delete=models.SET_NULL, null=True, blank=True, db_column='produit_id')
    nom_produit = models.CharField(max_length=255)
    prix_unit = models.DecimalField(max_digits=10, decimal_places=2)
    quantite = models.PositiveSmallIntegerField()

    class Meta:
        db_table = 'commande_items'

    @property
    def sous_total(self):
        return self.prix_unit * self.quantite
