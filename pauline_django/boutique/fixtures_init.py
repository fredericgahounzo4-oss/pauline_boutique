"""
Script de peuplement initial — Pauline Boutique
Exécuter avec : python manage.py shell < boutique/fixtures_init.py

Crée :
  - Les 3 catégories
  - Les 18 produits (chaussures, vêtements, accessoires)
  - Le compte admin (email: admin@pauline.com / mot de passe: Admin@1234)
"""
import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from boutique.models import Categorie, Produit, ProduitImage, Utilisateur

print("─── Création des catégories ───")

cats = {}
for nom, slug, desc in [
    ('Chaussures',  'chaussures',  'Sandales, escarpins et modèles tendance'),
    ('Vêtements',   'vetements',   'Boubous, robes et tenues traditionnelles'),
    ('Accessoires', 'accessoires', 'Sacs, pochettes et maroquinerie'),
]:
    cat, created = Categorie.objects.get_or_create(slug=slug, defaults={'nom': nom, 'description': desc})
    cats[slug] = cat
    print(f"  {'✓ Créé' if created else '  Existant'} : {nom}")

print("\n─── Création des produits ───")

produits_data = [
    # Chaussures
    ('Sandales AJ-175',
     'Élégantes sandales pour fillettes avec fleurs en strass et petit talon, idéales pour les cérémonies.',
     2500, 30, 'chaussures', '/images/products/chaus/chaussure.jpeg', 4.6, 214),
    ('Escarpins Dorés Soirée',
     'Escarpins à talon aiguille dorés, parfaits pour vos soirées et mariages. Semelle confortable et bride cheville réglable.',
     3500, 20, 'chaussures', '/images/products/chaus/mode6.jpeg', 4.7, 189),
    ('Sandales Wisteria (JN-2573)',
     'Des claquettes élégantes avec deux brides croisées sur le dessus, agrémentées de petites boucles dorées décoratives.',
     1300, 50, 'chaussures', '/images/products/chaus/chaussure modele1.jpeg', 4.8, 302),
    ('Sandales Bijoux (F2420)',
     'Des sandales à talons bas et transparents (effet cristal).',
     1500, 40, 'chaussures', '/images/products/chaus/chaussure modele3.jpeg', 4.5, 421),
    ('Sandales à découpe "H" (B2980)',
     "La semelle est agrémentée d'une couture apparente contrastée tout autour du bord intérieur.",
     1500, 35, 'chaussures', '/images/products/chaus/chaussure1.jpeg', 4.3, 678),
    ('Sandale à bandeau Burberry',
     'Des claquettes décontractées avec une semelle épaisse et colorée.',
     1500, 25, 'chaussures', '/images/products/chaus/chaussure2.jpeg', 4.3, 678),
    # Vêtements
    ('Modèle D.NO.95 (Style Paisley et Mandala)',
     'Un design très détaillé avec un grand médaillon central en forme de goutte (paisley) entouré de motifs circulaires.',
     2000, 15, 'vetements', '/images/products/asus/Boubous avec foulard.jpeg', 4.9, 543),
    ('Modèle D.NO.111 (Style Royal et Rayonné)',
     'Ce boubou se distingue par un motif central majestueux qui ressemble à un chandelier ou une fleur de lys dorée.',
     2000, 12, 'vetements', '/images/products/asus/Boubous7 avec foulard.jpeg', 4.8, 312),
    ('Modèle D.NO.97 (Style Géométrique Dashiki)',
     'Ce modèle présente une structure symétrique avec une grande croix centrale ornée de motifs circulaires et étoilés.',
     2000, 18, 'vetements', '/images/products/asus/Boubous1 avec foulard.jpeg', 4.7, 198),
    ('Modèle D.NO.120 (Style Floral Baroque)',
     'Un boubou élégant mêlant des médaillons circulaires (type rosace) et des motifs floraux de lys.',
     2000, 10, 'vetements', '/images/products/asus/Boubous2 avec foulard.jpeg', 4.6, 267),
    ('Modèle D.NO.118 (Style Abstrait et Lignes)',
     "L'encolure est particulièrement travaillée avec une large broderie noire et dorée qui descend sur le buste.",
     2000, 8, 'vetements', '/images/products/asus/Boubous6 avec foulard.jpeg', 4.9, 156),
    ('Modèle D.NO.88 (Style Arabesque Épuré)',
     "Un design sobre et graphique composé de rangées de petits motifs circulaires et de feuilles disposées en arcs.",
     2000, 14, 'vetements', '/images/products/asus/Boubous3 avec foulard.jpeg', 4.9, 156),
    # Accessoires
    ('Le Dôme Matelassé',
     'Duo chic de sac à main géométrique et sa pochette assortie.',
     3000, 22, 'accessoires', '/images/products/buds/mode1.jpg', 4.8, 856),
    ('Le Tote',
     'Sac shopping spacieux à motifs géométriques avec anses contrastées.',
     4000, 18, 'accessoires', '/images/products/buds/sac chic.jpeg', 4.7, 423),
    ('Le Camélia Prestige',
     'Sac blanc matelassé avec motifs de fleurs en relief, bandoulière en chaîne dorée et foulard en soie décoratif.',
     2000, 30, 'accessoires', '/images/products/buds/sac modele2.jpeg', 4.6, 589),
    ('Tote Bag Wax Imprimé',
     'Grand tote bag en tissu wax avec doublure intérieure. Robuste, spacieux et coloré.',
     4000, 25, 'accessoires', '/images/products/buds/sac_chic1.jpeg', 4.5, 712),
    ('Le Grand Cabas',
     "Sac fourre-tout haute capacité avec imprimés monogrammes variés et un élégant foulard noué à la anse.",
     2500, 16, 'accessoires', '/images/products/buds/sac5.jpg', 4.9, 334),
    ('Le Cabas Monogramme',
     "Grand sac trapèze bicolore mariant cuir uni et motifs imprimés.",
     4000, 12, 'accessoires', '/images/products/buds/mode3.jpg', 4.9, 334),
]

for nom, desc, prix, stock, cat_slug, image, note, nb_avis in produits_data:
    p, created = Produit.objects.get_or_create(
        nom=nom,
        defaults={
            'description':      desc,
            'prix':             prix,
            'stock':            stock,
            'categorie':        cats[cat_slug],
            'image_principale': image,
            'note_moyenne':     note,
            'nombre_avis':      nb_avis,
            'actif':            True,
        }
    )
    print(f"  {'✓ Créé' if created else '  Existant'} : {nom}")

print("\n─── Création du compte admin ───")
admin_user, created = Utilisateur.objects.get_or_create(
    email='admin@pauline.com',
    defaults={
        'nom':      'Admin Pauline',
        'role':     'admin',
        'is_staff': True,
        'actif':    True,
    }
)
if created:
    admin_user.set_password('Admin@1234')
    admin_user.save()
    print("  ✓ Admin créé : admin@pauline.com / Admin@1234")
else:
    print("  Existant : admin@pauline.com")

print("\n✅ Initialisation terminée !")
