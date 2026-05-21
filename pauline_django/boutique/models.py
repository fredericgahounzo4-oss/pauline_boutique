"""
Modèles Django — Pauline Boutique
Traduit fidèlement le schéma MySQL pauline_database.sql
"""
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


# ─── Gestionnaire utilisateur personnalisé ────────────────────────────────────
class UtilisateurManager(BaseUserManager):
    def create_user(self, email, nom, password=None, **extra_fields):
        if not email:
            raise ValueError("L'e-mail est obligatoire.")
        email = self.normalize_email(email)
        user = self.model(email=email, nom=nom, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, nom, password=None, **extra_fields):
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, nom, password, **extra_fields)


# ─── Utilisateurs (remplace TABLE utilisateurs) ───────────────────────────────
class Utilisateur(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [('client', 'Client'), ('admin', 'Admin')]

    nom        = models.CharField(max_length=150)
    email      = models.EmailField(unique=True)
    telephone  = models.CharField(max_length=20, blank=True, null=True)
    role       = models.CharField(max_length=10, choices=ROLE_CHOICES, default='client')
    actif      = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Champs requis par Django admin
    is_staff     = models.BooleanField(default=False)
    is_active    = models.BooleanField(default=True)

    objects = UtilisateurManager()

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['nom']

    class Meta:
        db_table = 'utilisateurs'
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'

    def __str__(self):
        return f"{self.nom} ({self.email})"

    @property
    def is_admin(self):
        return self.role == 'admin'


# ─── Catégories (remplace TABLE categories) ───────────────────────────────────
class Categorie(models.Model):
    nom         = models.CharField(max_length=100)
    slug        = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categories'
        verbose_name = 'Catégorie'
        verbose_name_plural = 'Catégories'

    def __str__(self):
        return self.nom


# ─── Produits (remplace TABLE produits) ───────────────────────────────────────
class Produit(models.Model):
    nom               = models.CharField(max_length=255)
    description       = models.TextField(blank=True, null=True)
    prix              = models.DecimalField(max_digits=10, decimal_places=2)
    stock             = models.PositiveIntegerField(default=0)
    categorie         = models.ForeignKey(Categorie, on_delete=models.RESTRICT, db_column='categorie_id')
    image_principale  = models.CharField(max_length=300, blank=True, null=True)
    note_moyenne      = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    nombre_avis       = models.PositiveIntegerField(default=0)
    actif             = models.BooleanField(default=True)
    created_at        = models.DateTimeField(auto_now_add=True)
    updated_at        = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'produits'
        verbose_name = 'Produit'
        verbose_name_plural = 'Produits'

    def __str__(self):
        return self.nom


# ─── Images galerie (remplace TABLE produit_images) ───────────────────────────
class ProduitImage(models.Model):
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name='images', db_column='produit_id')
    chemin  = models.CharField(max_length=300)
    ordre   = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table   = 'produit_images'
        ordering   = ['ordre']
        verbose_name = 'Image produit'

    def __str__(self):
        return f"Image {self.ordre} — {self.produit.nom}"


# ─── Adresses livraison (remplace TABLE adresses_livraison) ───────────────────
class AdresseLivraison(models.Model):
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, db_column='utilisateur_id')
    prenom      = models.CharField(max_length=100)
    nom         = models.CharField(max_length=100)
    telephone   = models.CharField(max_length=20, blank=True, null=True)
    adresse     = models.CharField(max_length=300)
    ville       = models.CharField(max_length=100)
    code_postal = models.CharField(max_length=20, blank=True, null=True)
    pays        = models.CharField(max_length=100, default='Togo')
    par_defaut  = models.BooleanField(default=False)

    class Meta:
        db_table = 'adresses_livraison'
        verbose_name = 'Adresse de livraison'


# ─── Commandes (remplace TABLE commandes) ─────────────────────────────────────
class Commande(models.Model):
    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('payee',      'Payée'),
        ('en_cours',   'En cours'),
        ('livree',     'Livrée'),
        ('annulee',    'Annulée'),
    ]
    METHODE_CHOICES = [
        ('mobile_money', 'Mobile Money'),
        ('carte',        'Carte bancaire'),
        ('livraison',    'Paiement à la livraison'),
    ]

    utilisateur       = models.ForeignKey(Utilisateur, on_delete=models.SET_NULL, null=True, blank=True, db_column='utilisateur_id')
    numero_commande   = models.CharField(max_length=50, unique=True)
    statut            = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_attente')
    montant_total     = models.DecimalField(max_digits=10, decimal_places=2)
    frais_livraison   = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    methode_paiement  = models.CharField(max_length=20, choices=METHODE_CHOICES)
    operateur_mobile  = models.CharField(max_length=50, blank=True, null=True)
    transaction_id    = models.CharField(max_length=200, blank=True, null=True)
    adresse_livraison = models.JSONField(blank=True, null=True)
    note_client       = models.TextField(blank=True, null=True)
    created_at        = models.DateTimeField(auto_now_add=True)
    updated_at        = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'commandes'
        ordering = ['-created_at']
        verbose_name = 'Commande'

    def __str__(self):
        return self.numero_commande


# ─── Articles de commande (remplace TABLE commande_items) ─────────────────────
class CommandeItem(models.Model):
    commande    = models.ForeignKey(Commande, on_delete=models.CASCADE, related_name='items', db_column='commande_id')
    produit     = models.ForeignKey(Produit, on_delete=models.SET_NULL, null=True, blank=True, db_column='produit_id')
    nom_produit = models.CharField(max_length=255)
    prix_unit   = models.DecimalField(max_digits=10, decimal_places=2)
    quantite    = models.PositiveSmallIntegerField()

    class Meta:
        db_table = 'commande_items'
        verbose_name = 'Article de commande'

    @property
    def sous_total(self):
        return self.prix_unit * self.quantite

    def __str__(self):
        return f"{self.nom_produit} x{self.quantite}"


# ─── Wishlist (remplace TABLE wishlist) ───────────────────────────────────────
class Wishlist(models.Model):
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, db_column='utilisateur_id')
    produit     = models.ForeignKey(Produit, on_delete=models.CASCADE, db_column='produit_id')
    added_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table   = 'wishlist'
        unique_together = ('utilisateur', 'produit')
        verbose_name = 'Wishlist'


# ─── Avis (remplace TABLE avis) ───────────────────────────────────────────────
class Avis(models.Model):
    produit     = models.ForeignKey(Produit, on_delete=models.CASCADE, db_column='produit_id')
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.SET_NULL, null=True, blank=True, db_column='utilisateur_id')
    note        = models.PositiveSmallIntegerField()  # 1-5
    commentaire = models.TextField(blank=True, null=True)
    valide      = models.BooleanField(default=False)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'avis'
        verbose_name = 'Avis'
        verbose_name_plural = 'Avis'
