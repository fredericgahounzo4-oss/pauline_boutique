# Pauline Boutique — Backend Django

Migration complète du backend PHP/MySQL vers Django REST Framework.

## Structure

```
pauline_api/
├── pauline_api/          # Configuration Django
│   ├── settings.py       # Config DB, CORS, DRF
│   └── urls.py           # Routes principales
├── boutique/             # App Django principale
│   ├── models.py         # Modèles (Produit, Categorie, Commande, Utilisateur...)
│   ├── views.py          # Vues API (équivalents PHP)
│   ├── serializers.py    # Sérialisation JSON
│   ├── urls.py           # Routes API
│   └── management/commands/seed_data.py  # Données initiales
├── requirements.txt
└── pauline_shop.db       # SQLite (ou MySQL, voir settings.py)
```

## Correspondance des endpoints (PHP → Django)

| PHP                             | Django (préfixe /api/)         |
|---------------------------------|-------------------------------|
| auth/login.php                  | auth/login                    |
| auth/register.php               | auth/register                 |
| produits/list.php               | produits/list                 |
| commandes/create.php            | commandes/create              |
| admin/stats.php                 | admin/stats                   |
| admin/commandes_list.php        | admin/commandes               |
| admin/commande_statut.php       | admin/commande-statut         |
| admin/produits_list.php         | admin/produits                |
| admin/produits_add.php          | admin/produits/add            |
| admin/produits_edit.php         | admin/produits/edit           |
| admin/produits_delete.php       | admin/produits/delete         |

## Installation

```bash
pip install -r requirements.txt

# Base de données
python manage.py migrate

# Données initiales (catégories, produits, admin)
python manage.py seed_data

# Lancer le serveur
python manage.py runserver 8000
```

## Utiliser MySQL (à la place de SQLite)

Dans `settings.py`, remplacer le bloc `DATABASES` par :

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'pauline_shop',
        'USER': 'root',
        'PASSWORD': '',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

Et installer : `pip install mysqlclient`

## Mise à jour du frontend React

Dans vos fichiers React, changer l'URL de base :

```js
// Avant (PHP)
const API = 'http://localhost/pauline-api'

// Après (Django)
const API = 'http://localhost:8000/api'
```

Les URLs restent identiques (ex: `/api/auth/login`, `/api/produits/list`).

## Compte admin par défaut

- Email : `admin@pauline.com`
- Mot de passe : `Admin@1234`
