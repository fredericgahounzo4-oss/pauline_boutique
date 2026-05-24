import bcrypt
from django.core.management.base import BaseCommand
from boutique.models import Categorie, Produit, ProduitImage, Utilisateur

CATEGORIES = [
    {'nom': 'Chaussures',  'slug': 'chaussures',  'description': 'Sandales, escarpins et modèles tendance'},
    {'nom': 'Vêtements',   'slug': 'vetements',   'description': 'Boubous, robes et tenues traditionnelles'},
    {'nom': 'Accessoires', 'slug': 'accessoires', 'description': 'Sacs, pochettes et maroquinerie'},
]

PRODUITS = [
    {'nom': 'Sandales AJ-175', 'description': 'Sandales pour fillettes avec fleurs en strass.', 'prix': 2500, 'stock': 30, 'cat': 'chaussures', 'image': '/images/products/chaus/chaussure.jpeg', 'note': 4.6, 'avis': 214},
    {'nom': 'Escarpins Dorés Soirée', 'description': 'Escarpins à talon aiguille dorés pour soirées.', 'prix': 3500, 'stock': 20, 'cat': 'chaussures', 'image': '/images/products/chaus/mode6.jpeg', 'note': 4.7, 'avis': 189},
    {'nom': 'Sandales Wisteria (JN-2573)', 'description': 'Claquettes élégantes avec brides croisées.', 'prix': 1300, 'stock': 50, 'cat': 'chaussures', 'image': '/images/products/chaus/chaussure modele1.jpeg', 'note': 4.8, 'avis': 302},
    {'nom': 'Sandales Bijoux (F2420)', 'description': 'Sandales à talons bas transparents effet cristal.', 'prix': 1500, 'stock': 40, 'cat': 'chaussures', 'image': '/images/products/chaus/chaussure modele3.jpeg', 'note': 4.5, 'avis': 421},
    {'nom': 'Sandales à découpe H (B2980)', 'description': 'Semelle avec couture apparente contrastée.', 'prix': 1500, 'stock': 35, 'cat': 'chaussures', 'image': '/images/products/chaus/chaussure1.jpeg', 'note': 4.3, 'avis': 678},
    {'nom': 'Sandale à bandeau Burberry', 'description': 'Claquettes décontractées avec semelle épaisse.', 'prix': 1500, 'stock': 25, 'cat': 'chaussures', 'image': '/images/products/chaus/chaussure2.jpeg', 'note': 4.3, 'avis': 678},
    {'nom': 'Modèle D.NO.95 (Style Paisley)', 'description': 'Design détaillé avec médaillon central paisley.', 'prix': 2000, 'stock': 15, 'cat': 'vetements', 'image': '/images/products/asus/Boubous avec foulard.jpeg', 'note': 4.9, 'avis': 543},
    {'nom': 'Modèle D.NO.111 (Style Royal)', 'description': 'Boubou avec motif central majestueux fleur de lys.', 'prix': 2000, 'stock': 12, 'cat': 'vetements', 'image': '/images/products/asus/Boubous7 avec foulard.jpeg', 'note': 4.8, 'avis': 312},
    {'nom': 'Modèle D.NO.97 (Style Dashiki)', 'description': 'Structure symétrique avec grande croix centrale.', 'prix': 2000, 'stock': 18, 'cat': 'vetements', 'image': '/images/products/asus/Boubous1 avec foulard.jpeg', 'note': 4.7, 'avis': 198},
    {'nom': 'Modèle D.NO.120 (Style Floral)', 'description': 'Boubou élégant avec médaillons circulaires et lys.', 'prix': 2000, 'stock': 10, 'cat': 'vetements', 'image': '/images/products/asus/Boubous2 avec foulard.jpeg', 'note': 4.6, 'avis': 267},
    {'nom': 'Modèle D.NO.118 (Style Abstrait)', 'description': 'Encolure travaillée broderie noire et dorée.', 'prix': 2000, 'stock': 8, 'cat': 'vetements', 'image': '/images/products/asus/Boubous6 avec foulard.jpeg', 'note': 4.9, 'avis': 156},
    {'nom': 'Modèle D.NO.88 (Style Arabesque)', 'description': 'Design sobre avec motifs circulaires en arcs.', 'prix': 2000, 'stock': 14, 'cat': 'vetements', 'image': '/images/products/asus/Boubous3 avec foulard.jpeg', 'note': 4.9, 'avis': 156},
    {'nom': 'Le Dôme Matelassé', 'description': 'Duo chic de sac à main géométrique et pochette assortie.', 'prix': 3000, 'stock': 22, 'cat': 'accessoires', 'image': '/images/products/buds/mode1.jpg', 'note': 4.8, 'avis': 856},
    {'nom': 'Le Tote', 'description': 'Sac shopping spacieux à motifs géométriques.', 'prix': 4000, 'stock': 18, 'cat': 'accessoires', 'image': '/images/products/buds/sac chic.jpeg', 'note': 4.7, 'avis': 423},
    {'nom': 'Le Camélia Prestige', 'description': 'Sac blanc matelassé avec fleurs en relief.', 'prix': 2000, 'stock': 30, 'cat': 'accessoires', 'image': '/images/products/buds/sac modele2.jpeg', 'note': 4.6, 'avis': 589},
    {'nom': 'Tote Bag Wax Imprimé', 'description': 'Grand tote bag en tissu wax avec doublure.', 'prix': 4000, 'stock': 25, 'cat': 'accessoires', 'image': '/images/products/buds/sac_chic1.jpeg', 'note': 4.5, 'avis': 712},
    {'nom': 'Le Grand Cabas', 'description': 'Sac fourre-tout avec imprimés monogrammes.', 'prix': 2500, 'stock': 16, 'cat': 'accessoires', 'image': '/images/products/buds/sac5.jpg', 'note': 4.9, 'avis': 334},
    {'nom': 'Le Cabas Monogramme', 'description': 'Grand sac trapèze bicolore avec pochette.', 'prix': 4000, 'stock': 12, 'cat': 'accessoires', 'image': '/images/products/buds/mode3.jpg', 'note': 4.9, 'avis': 334},
]

class Command(BaseCommand):
    help = 'Seed la base avec les données initiales'

    def handle(self, *args, **kwargs):
        cats = {}
        for c in CATEGORIES:
            obj, created = Categorie.objects.get_or_create(slug=c['slug'], defaults=c)
            cats[c['slug']] = obj
            if created:
                self.stdout.write(f'  Categorie: {obj.nom}')

        for p in PRODUITS:
            obj, created = Produit.objects.get_or_create(
                nom=p['nom'],
                defaults={'description': p['description'], 'prix': p['prix'], 'stock': p['stock'],
                          'categorie': cats[p['cat']], 'image_principale': p['image'],
                          'note_moyenne': p['note'], 'nombre_avis': p['avis'], 'actif': True}
            )
            if created:
                self.stdout.write(f'  Produit: {obj.nom}')

        hashed = bcrypt.hashpw(b'Admin@1234', bcrypt.gensalt()).decode()
        admin, created = Utilisateur.objects.get_or_create(
            email='admin@pauline.com',
            defaults={'nom': 'Admin Pauline', 'mot_de_passe': hashed, 'role': 'admin'}
        )
        if created:
            self.stdout.write('  Admin: admin@pauline.com / Admin@1234')

        self.stdout.write(self.style.SUCCESS('Seed termine!'))
