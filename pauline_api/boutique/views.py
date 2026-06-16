import uuid
import hashlib
import secrets
from django.db import transaction
from django.db.models import Count, Sum, Q
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
import bcrypt
import os
import cloudinary
import cloudinary.uploader
from pathlib import Path

from .models import Categorie, Produit, ProduitImage, Utilisateur, Commande, CommandeItem, PasswordResetToken
from .serializers import (
    ProduitSerializer, ProduitAdminSerializer,
    CommandeSerializer, CategorieSerializer
)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), hashed.encode())
    except Exception:
        return False


def generate_token() -> str:
    return secrets.token_hex(32)


def generate_numero_commande() -> str:
    import datetime
    year = datetime.datetime.now().year
    suffix = hashlib.md5(str(uuid.uuid4()).encode()).hexdigest()[:8].upper()
    return f"CMD-{year}-{suffix}"


def upload_to_cloudinary(image_file):
    result = cloudinary.uploader.upload(
        image_file,
        folder='pauline_boutique/products',
        transformation=[
            {'width': 800, 'height': 800, 'crop': 'limit',
             'quality': 'auto', 'fetch_format': 'auto'}
        ]
    )
    return result.get('secure_url')


# ─── AUTH ─────────────────────────────────────────────────────────────────────

@api_view(['POST', 'OPTIONS'])
def login(request):
    data = request.data
    email = (data.get('email') or '').strip()
    password = data.get('password') or ''

    if not email or not password:
        return Response({"error": "E-mail et mot de passe requis."}, status=400)

    try:
        user = Utilisateur.objects.get(email=email, actif=True)
    except Utilisateur.DoesNotExist:
        return Response({"error": "E-mail ou mot de passe incorrect."}, status=401)

    if not verify_password(password, user.mot_de_passe):
        return Response({"error": "E-mail ou mot de passe incorrect."}, status=401)

    return Response({
        "success": True,
        "token": generate_token(),
        "user": {"id": user.id, "nom": user.nom, "email": user.email, "role": user.role}
    })


@api_view(['POST', 'OPTIONS'])
def register(request):
    data = request.data
    nom = (data.get('nom') or '').strip()
    email = (data.get('email') or '').strip()
    password = data.get('password') or ''

    errors = []
    if not nom: errors.append("Le nom est requis.")
    if not email: errors.append("L'e-mail est requis.")
    elif '@' not in email or '.' not in email: errors.append("L'adresse e-mail est invalide.")
    if not password: errors.append("Le mot de passe est requis.")
    elif len(password) < 8: errors.append("Le mot de passe doit contenir au moins 8 caractères.")

    if errors:
        return Response({"error": " ".join(errors)}, status=400)

    if Utilisateur.objects.filter(email=email).exists():
        return Response({"error": "Cet e-mail est déjà utilisé. Connectez-vous."}, status=409)

    user = Utilisateur.objects.create(nom=nom, email=email, mot_de_passe=hash_password(password), role='client')

    return Response({
        "success": True,
        "message": "Compte créé avec succès !",
        "user": {"id": user.id, "nom": user.nom, "email": user.email, "role": user.role}
    }, status=201)


@api_view(['POST', 'OPTIONS'])
def check_email(request):
    email = (request.data.get('email') or '').strip()
    if not email:
        return Response({"exists": False})
    try:
        user = Utilisateur.objects.get(email=email, actif=True)
        return Response({"exists": True, "nom": user.nom})
    except Utilisateur.DoesNotExist:
        return Response({"exists": False})


@api_view(['POST', 'OPTIONS'])
def reset_password(request):
    email        = (request.data.get('email') or '').strip()
    new_password = request.data.get('new_password') or ''
    if not email or not new_password:
        return Response({"success": False}, status=400)
    try:
        user = Utilisateur.objects.get(email=email, actif=True)
    except Utilisateur.DoesNotExist:
        return Response({"success": False}, status=404)
    user.mot_de_passe = hash_password(new_password)
    user.save()
    return Response({"success": True})


@api_view(['POST', 'OPTIONS'])
def forgot_password(request):
    import datetime
    from django.utils import timezone
    email = (request.data.get('email') or '').strip()
    if not email:
        return Response({"success": False, "error": "E-mail requis."}, status=400)
    try:
        user = Utilisateur.objects.get(email=email, actif=True)
    except Utilisateur.DoesNotExist:
        return Response({"success": False, "error": "Aucun compte trouvé."}, status=404)
    PasswordResetToken.objects.filter(utilisateur=user, used=False).delete()
    token = secrets.token_hex(32)
    expire = timezone.now() + datetime.timedelta(minutes=30)
    PasswordResetToken.objects.create(utilisateur=user, token=token, expire_at=expire)
    return Response({"success": True, "token": token, "nom": user.nom})


@api_view(['POST', 'OPTIONS'])
def verify_reset_token(request):
    token = (request.data.get('token') or '').strip()
    if not token:
        return Response({"valid": False})
    try:
        t = PasswordResetToken.objects.get(token=token)
        return Response({"valid": t.is_valid()})
    except PasswordResetToken.DoesNotExist:
        return Response({"valid": False})


@api_view(['POST', 'OPTIONS'])
def reset_password_token(request):
    token        = (request.data.get('token') or '').strip()
    new_password = request.data.get('new_password') or ''
    if not token or not new_password or len(new_password) < 8:
        return Response({"success": False, "error": "Données invalides."}, status=400)
    try:
        t = PasswordResetToken.objects.get(token=token)
    except PasswordResetToken.DoesNotExist:
        return Response({"success": False, "error": "Token invalide."}, status=404)
    if not t.is_valid():
        return Response({"success": False, "error": "Lien expiré."}, status=400)
    t.utilisateur.mot_de_passe = hash_password(new_password)
    t.utilisateur.save()
    t.used = True
    t.save()
    return Response({"success": True})


# ─── PRODUITS ─────────────────────────────────────────────────────────────────

@api_view(['GET', 'OPTIONS'])
def produits_list(request):
    categorie_slug = request.GET.get('categorie')
    search = request.GET.get('search')

    qs = Produit.objects.filter(actif=True).select_related('categorie').prefetch_related('images')

    if categorie_slug:
        qs = qs.filter(categorie__slug=categorie_slug)
    if search:
        qs = qs.filter(Q(nom__icontains=search) | Q(description__icontains=search))

    qs = qs.order_by('id')
    return Response({"success": True, "produits": ProduitSerializer(qs, many=True).data, "total": qs.count()})


# ─── COMMANDES ────────────────────────────────────────────────────────────────

@api_view(['POST', 'OPTIONS'])
def commandes_create(request):
    data = request.data
    items = data.get('items', [])
    montant = float(data.get('montant_total', 0) or 0)
    methode = (data.get('methode_paiement') or '').strip()
    operateur = data.get('operateur_mobile')
    transaction_id = data.get('transaction_id')
    adresse = data.get('adresse_livraison', {})
    utilisateur_id = data.get('utilisateur_id')

    if not items or montant <= 0 or not methode:
        return Response({"error": "Données de commande incomplètes."}, status=400)

    numero = generate_numero_commande()

    try:
        with transaction.atomic():
            utilisateur = None
            if utilisateur_id:
                try:
                    utilisateur = Utilisateur.objects.get(id=utilisateur_id)
                except Utilisateur.DoesNotExist:
                    pass

            commande = Commande.objects.create(
                utilisateur=utilisateur, numero_commande=numero,
                montant_total=montant, methode_paiement=methode,
                operateur_mobile=operateur, transaction_id=transaction_id,
                adresse_livraison=adresse, statut='payee',
            )

            for item in items:
                produit = None
                try:
                    produit = Produit.objects.get(id=int(item.get('id', 0)))
                except (Produit.DoesNotExist, ValueError):
                    pass

                CommandeItem.objects.create(
                    commande=commande, produit=produit,
                    nom_produit=item.get('name', 'Produit'),
                    prix_unit=float(item.get('price', 0)),
                    quantite=int(item.get('quantity', 1)),
                )

    except Exception as e:
        return Response({"error": f"Erreur : {str(e)}"}, status=500)

    return Response({"success": True, "commande_id": commande.id, "numero_commande": numero})


# ─── ADMIN : stats ────────────────────────────────────────────────────────────

@api_view(['GET', 'OPTIONS'])
def admin_stats(request):
    nb_produits = Produit.objects.filter(actif=True).count()
    nb_clients = Utilisateur.objects.filter(role='client').count()
    nb_commandes = Commande.objects.count()
    chiffre_affaires = Commande.objects.exclude(statut='annulee').aggregate(total=Sum('montant_total'))['total'] or 0

    dernieres = Commande.objects.select_related('utilisateur').order_by('-created_at')[:5]
    dernieres_data = [
        {"id": c.id, "numero_commande": c.numero_commande, "statut": c.statut,
         "montant_total": float(c.montant_total), "created_at": c.created_at.isoformat(),
         "client_nom": c.utilisateur.nom if c.utilisateur else None}
        for c in dernieres
    ]

    return Response({
        "success": True, "nb_produits": nb_produits, "nb_clients": nb_clients,
        "nb_commandes": nb_commandes, "chiffre_affaires": float(chiffre_affaires),
        "dernieres_commandes": dernieres_data,
    })


# ─── ADMIN : commandes ────────────────────────────────────────────────────────

@api_view(['GET', 'OPTIONS'])
def admin_commandes_list(request):
    qs = Commande.objects.select_related('utilisateur').prefetch_related('items').order_by('-created_at')
    return Response({"success": True, "commandes": CommandeSerializer(qs, many=True).data, "total": qs.count()})


@api_view(['POST', 'OPTIONS'])
def admin_commande_statut(request):
    commande_id = int(request.data.get('id', 0) or 0)
    statut = (request.data.get('statut') or '').strip()
    statuts_valides = ['en_attente', 'payee', 'en_cours', 'livree', 'annulee']

    if not commande_id or statut not in statuts_valides:
        return Response({"error": "ID ou statut invalide."}, status=400)

    try:
        commande = Commande.objects.get(id=commande_id)
    except Commande.DoesNotExist:
        return Response({"error": "Commande introuvable."}, status=404)

    commande.statut = statut
    commande.save()
    return Response({"success": True})


# ─── ADMIN : produits ─────────────────────────────────────────────────────────

@api_view(['GET', 'OPTIONS'])
def admin_produits_list(request):
    qs = Produit.objects.select_related('categorie').order_by('-id')
    return Response({"success": True, "produits": ProduitAdminSerializer(qs, many=True).data, "total": qs.count()})


@api_view(['POST', 'OPTIONS'])
def admin_produits_add(request):
    nom          = (request.data.get('nom') or request.POST.get('nom') or '').strip()
    description  = (request.data.get('description') or request.POST.get('description') or '').strip()
    prix         = float(request.data.get('prix') or request.POST.get('prix') or 0)
    stock        = int(request.data.get('stock') or request.POST.get('stock') or 0)
    categorie_id = int(request.data.get('categorie_id') or request.POST.get('categorie_id') or 0)

    if not nom or prix <= 0 or not categorie_id:
        return Response({"error": "Nom, prix et catégorie sont obligatoires."}, status=400)

    try:
        categorie = Categorie.objects.get(id=categorie_id)
    except Categorie.DoesNotExist:
        return Response({"error": "Catégorie invalide."}, status=400)

    image_url = None
    if 'image' in request.FILES:
        try:
            image_url = upload_to_cloudinary(request.FILES['image'])
        except Exception as e:
            return Response({"error": f"Erreur upload image : {str(e)}"}, status=500)

    produit = Produit.objects.create(
        nom=nom, description=description, prix=prix,
        stock=stock, categorie=categorie,
        image_principale=image_url, actif=True
    )

    # Lire actif depuis le formulaire si fourni
    actif_val = request.data.get('actif') or request.POST.get('actif')
    if actif_val is not None:
        produit.actif = str(actif_val) in ['1', 'true', 'True']
        produit.save()

    return Response({
        'success': True, 'message': 'Produit ajouté.', 'id': produit.id, 'image': image_url
    })




@api_view(['POST', 'OPTIONS'])
def admin_produits_edit(request):
    produit_id = int(request.data.get('id') or request.POST.get('id') or 0)
    if not produit_id:
        return Response({"error": "ID produit manquant."}, status=400)

    try:
        produit = Produit.objects.get(id=produit_id)
    except Produit.DoesNotExist:
        return Response({"error": "Produit introuvable."}, status=404)

    # Image — garder l'ancienne si pas de nouvelle
    image_url = produit.image_principale
    if 'image' in request.FILES:
        try:
            image_url = upload_to_cloudinary(request.FILES['image'])
        except Exception as e:
            return Response({"error": f"Erreur upload image : {str(e)}"}, status=500)

    produit.nom         = (request.data.get('nom') or request.POST.get('nom') or produit.nom).strip()
    produit.description = (request.data.get('description') or request.POST.get('description') or produit.description or '').strip()
    produit.prix        = float(request.data.get('prix') or request.POST.get('prix') or produit.prix)
    produit.stock       = int(request.data.get('stock') or request.POST.get('stock') or produit.stock)

    cat_id = int(request.data.get('categorie_id') or request.POST.get('categorie_id') or produit.categorie_id)
    try:
        produit.categorie = Categorie.objects.get(id=cat_id)
    except Categorie.DoesNotExist:
        pass

    produit.image_principale = image_url

    # ── Correction du champ actif ──────────────────────────────────────────────
    if 'actif' in request.data:
        actif_val = request.data.get('actif')
    elif 'actif' in request.POST:
        actif_val = request.POST.get('actif')
    else:
        actif_val = None

    if actif_val is not None:
        produit.actif = str(actif_val) in ["1", "true", "True"]

    produit.save()

    return Response({"success": True, "message": "Produit modifié.", "image": image_url})


@api_view(['POST', 'OPTIONS'])
def admin_produits_delete(request):
    produit_id = int(request.data.get('id', 0) or 0)
    if not produit_id:
        return Response({"error": "ID produit manquant."}, status=400)

    try:
        produit = Produit.objects.get(id=produit_id)
    except Produit.DoesNotExist:
        return Response({"error": "Produit introuvable."}, status=404)

    produit.actif = False
    produit.save()
    return Response({"success": True, "message": "Produit supprimé."})


# ─── CATEGORIES ───────────────────────────────────────────────────────────────

@api_view(['GET', 'OPTIONS'])
def categories_list(request):
    cats = Categorie.objects.all()
    return Response({"success": True, "categories": CategorieSerializer(cats, many=True).data})
