"""
Vues Django REST — Pauline Boutique
Chaque vue remplace exactement un fichier PHP :

  auth/login.php          → LoginView
  auth/register.php       → RegisterView
  produits/list.php       → ProduitListView
  commandes/create.php    → CommandeCreateView
  admin/stats.php         → AdminStatsView
  admin/produits_list.php → AdminProduitListView
  admin/produits_add.php  → AdminProduitAddView
  admin/produits_edit.php → AdminProduitEditView
  admin/produits_delete.php→ AdminProduitDeleteView
  admin/commandes_list.php→ AdminCommandeListView
  admin/commande_statut.php→ AdminCommandeStatutView
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


# ─── Helpers ──────────────────────────────────────────────────────────────────
def get_tokens_for_user(user):
    """Génère access + refresh JWT pour un utilisateur"""
    refresh = RefreshToken.for_user(user)
    return {
        'token': str(refresh.access_token),   # même clé "token" que le PHP
        'refresh': str(refresh),
    }


def user_to_dict(user):
    """Même structure JSON que le PHP retournait"""
    return {
        'id':    user.id,
        'nom':   user.nom,
        'email': user.email,
        'role':  user.role,
    }


# ─── Auth ─────────────────────────────────────────────────────────────────────
class RegisterView(APIView):
    """Remplace auth/register.php"""

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            # Aplatir les erreurs comme PHP le faisait
            errors = []
            for field_errors in serializer.errors.values():
                errors.extend(field_errors)
            return Response(
                {'error': ' '.join(str(e) for e in errors)},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.save()
        tokens = get_tokens_for_user(user)

        return Response({
            'success': True,
            'message': 'Compte créé avec succès !',
            'user': user_to_dict(user),
            **tokens,
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """Remplace auth/login.php"""

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            errors = []
            for field_errors in serializer.errors.values():
                errors.extend(field_errors)
            return Response(
                {'error': ' '.join(str(e) for e in errors)},
                status=status.HTTP_401_UNAUTHORIZED
            )

        user = serializer.validated_data['user']
        tokens = get_tokens_for_user(user)

        return Response({
            'success': True,
            'user': user_to_dict(user),
            **tokens,
        })


# ─── Produits (public) ────────────────────────────────────────────────────────
class ProduitListView(APIView):
    """Remplace produits/list.php — supporte ?categorie= et ?search="""

    def get(self, request):
        qs = Produit.objects.filter(actif=True).select_related('categorie').prefetch_related('images')

        categorie = request.GET.get('categorie')
        search    = request.GET.get('search')

        if categorie:
            qs = qs.filter(categorie__slug=categorie)

        if search:
            qs = qs.filter(
                Q(nom__icontains=search) | Q(description__icontains=search)
            )

        qs = qs.order_by('id')
        serializer = ProduitSerializer(qs, many=True)

        return Response({
            'success':  True,
            'produits': serializer.data,
            'total':    qs.count(),
        })


# ─── Commandes ────────────────────────────────────────────────────────────────
class CommandeCreateView(APIView):
    """Remplace commandes/create.php"""

    def post(self, request):
        serializer = CommandeCreateSerializer(data=request.data)
        if not serializer.is_valid():
            errors = []
            for field_errors in serializer.errors.values():
                errors.extend(field_errors)
            return Response(
                {'error': ' '.join(str(e) for e in errors)},
                status=status.HTTP_400_BAD_REQUEST
            )

        data = serializer.validated_data

        # Numéro de commande unique — même format que PHP
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
            return Response(
                {'error': f"Erreur lors de l'enregistrement : {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response({
            'success':         True,
            'commande_id':     commande.id,
            'numero_commande': numero,
            'message':         'Commande enregistrée avec succès.',
        })


# ─── Admin ────────────────────────────────────────────────────────────────────
class AdminStatsView(APIView):
    """Remplace admin/stats.php"""
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        from .models import Utilisateur as U, Produit as P, Commande as C

        nb_produits  = P.objects.filter(actif=True).count()
        nb_clients   = U.objects.filter(role='client').count()
        nb_commandes = C.objects.count()

        ca_result = C.objects.exclude(statut='annulee').aggregate(
            total=Sum('montant_total')
        )
        chiffre_affaires = float(ca_result['total'] or 0)

        dernieres = C.objects.select_related('utilisateur').order_by('-created_at')[:5]
        dernieres_data = [
            {
                'id':               c.id,
                'numero_commande':  c.numero_commande,
                'statut':           c.statut,
                'montant_total':    float(c.montant_total),
                'created_at':       c.created_at.isoformat(),
                'client_nom':       c.utilisateur.nom if c.utilisateur else None,
            }
            for c in dernieres
        ]

        return Response({
            'success':             True,
            'nb_produits':         nb_produits,
            'nb_clients':          nb_clients,
            'nb_commandes':        nb_commandes,
            'chiffre_affaires':    chiffre_affaires,
            'dernieres_commandes': dernieres_data,
        })


class AdminProduitListView(APIView):
    """Remplace admin/produits_list.php"""
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        produits   = Produit.objects.select_related('categorie').order_by('-id')
        serializer = ProduitAdminSerializer(produits, many=True)
        return Response({
            'success':  True,
            'produits': serializer.data,
            'total':    produits.count(),
        })


class AdminProduitAddView(APIView):
    """Remplace admin/produits_add.php — accepte multipart/form-data"""
    permission_classes = [IsAuthenticated, IsAdminRole]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        nom          = request.data.get('nom', '').strip()
        description  = request.data.get('description', '').strip()
        prix         = float(request.data.get('prix', 0) or 0)
        stock        = int(request.data.get('stock', 0) or 0)
        categorie_id = int(request.data.get('categorie_id', 0) or 0)
        image_file   = request.FILES.get('image')

        # Validation
        if not nom or prix <= 0 or not categorie_id:
            return Response(
                {'error': 'Nom, prix et catégorie sont obligatoires.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            categorie = Categorie.objects.get(id=categorie_id)
        except Categorie.DoesNotExist:
            return Response({'error': 'Catégorie invalide.'}, status=400)

        image_path = None
        if image_file:
            import os, time, random
            from django.conf import settings

            ext      = os.path.splitext(image_file.name)[1].lower()
            allowed  = ['.jpg', '.jpeg', '.png', '.webp']
            if ext not in allowed:
                return Response(
                    {'error': 'Format image non autorisé. Utilisez JPG, PNG ou WEBP.'},
                    status=400
                )

            filename  = f"prod_{int(time.time())}_{random.randint(1000,9999)}{ext}"
            save_path = os.path.join(settings.MEDIA_ROOT, 'products', 'uploads', filename)
            os.makedirs(os.path.dirname(save_path), exist_ok=True)

            with open(save_path, 'wb') as f:
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
            'success': True,
            'message': 'Produit ajouté avec succès.',
            'id':      produit.id,
            'image':   image_path,
        }, status=status.HTTP_201_CREATED)


class AdminProduitEditView(APIView):
    """Remplace admin/produits_edit.php"""
    permission_classes = [IsAuthenticated, IsAdminRole]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        prod_id = int(request.data.get('id', 0) or 0)
        if not prod_id:
            return Response({'error': 'ID produit manquant.'}, status=400)

        try:
            produit = Produit.objects.get(id=prod_id)
        except Produit.DoesNotExist:
            return Response({'error': 'Produit introuvable.'}, status=404)

        image_path = produit.image_principale
        image_file = request.FILES.get('image')

        if image_file:
            import os, time, random
            from django.conf import settings

            ext     = os.path.splitext(image_file.name)[1].lower()
            allowed = ['.jpg', '.jpeg', '.png', '.webp']
            if ext in allowed:
                filename  = f"prod_{int(time.time())}_{random.randint(1000,9999)}{ext}"
                save_path = os.path.join(settings.MEDIA_ROOT, 'products', 'uploads', filename)
                os.makedirs(os.path.dirname(save_path), exist_ok=True)
                with open(save_path, 'wb') as f:
                    for chunk in image_file.chunks():
                        f.write(chunk)
                image_path = f"/media/products/uploads/{filename}"

        produit.nom              = request.data.get('nom', produit.nom).strip()
        produit.description      = request.data.get('description', produit.description).strip()
        produit.prix             = float(request.data.get('prix', produit.prix) or produit.prix)
        produit.stock            = int(request.data.get('stock', produit.stock) or produit.stock)
        produit.categorie_id     = int(request.data.get('categorie_id', produit.categorie_id) or produit.categorie_id)
        produit.actif            = int(request.data.get('actif', produit.actif))
        produit.image_principale = image_path
        produit.save()

        return Response({
            'success': True,
            'message': 'Produit modifié avec succès.',
            'image':   image_path,
        })


class AdminProduitDeleteView(APIView):
    """Remplace admin/produits_delete.php — soft-delete (actif=0)"""
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request):
        prod_id = int(request.data.get('id', 0) or 0)
        if not prod_id:
            return Response({'error': 'ID produit manquant.'}, status=400)

        try:
            produit = Produit.objects.get(id=prod_id)
        except Produit.DoesNotExist:
            return Response({'error': 'Produit introuvable.'}, status=404)

        produit.actif = False
        produit.save()

        return Response({'success': True, 'message': 'Produit supprimé avec succès.'})


class AdminCommandeListView(APIView):
    """Remplace admin/commandes_list.php"""
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        commandes  = Commande.objects.select_related('utilisateur').prefetch_related('items').order_by('-created_at')
        serializer = CommandeAdminSerializer(commandes, many=True)
        return Response({
            'success':   True,
            'commandes': serializer.data,
            'total':     commandes.count(),
        })


class AdminCommandeStatutView(APIView):
    """Remplace admin/commande_statut.php"""
    permission_classes = [IsAuthenticated, IsAdminRole]

    STATUTS_VALIDES = ['en_attente', 'payee', 'en_cours', 'livree', 'annulee']

    def post(self, request):
        cmd_id = int(request.data.get('id', 0) or 0)
        statut = request.data.get('statut', '').strip()

        if not cmd_id or statut not in self.STATUTS_VALIDES:
            return Response({'error': 'ID ou statut invalide.'}, status=400)

        try:
            commande = Commande.objects.get(id=cmd_id)
        except Commande.DoesNotExist:
            return Response({'error': 'Commande introuvable.'}, status=404)

        commande.statut = statut
        commande.save()

        return Response({'success': True, 'message': f'Statut mis à jour : {statut}'})


# ─── Catégories (bonus — utile pour les selects dans AdminProduits) ───────────
class CategorieListView(APIView):
    def get(self, request):
        from .models import Categorie as C
        cats = C.objects.values('id', 'nom', 'slug')
        return Response({'success': True, 'categories': list(cats)})


# ─── Check Email (utilisé par ForgotPassword avant envoi EmailJS) ─────────────
class CheckEmailView(APIView):
    """
    POST /api/auth/check-email/
    Body: { "email": "..." }
    Retourne { exists: true, nom: "..." } si l'email existe, { exists: false } sinon.
    """
    def post(self, request):
        email = request.data.get('email', '').strip().lower()

        if not email or '@' not in email:
            return Response({'exists': False})

        try:
            user = Utilisateur.objects.get(email=email)
            return Response({'exists': True, 'nom': user.nom})
        except Utilisateur.DoesNotExist:
            return Response({'exists': False})
