# 🚀 Déploiement Pauline Boutique sur Render

## Ce que vous allez créer sur Render (gratuit)
- **1 service Web** → Backend Django (API)
- **1 base de données PostgreSQL** → Données
- **1 service Web statique** → Frontend React

---

## ÉTAPE 1 — Préparer GitHub

Créez **2 dépôts GitHub** (ou un seul avec 2 dossiers) :
- `pauline-api` → contenu du dossier `pauline_django/`
- `pauline-front` → contenu du dossier `pauline/`

---

## ÉTAPE 2 — Créer la base PostgreSQL sur Render

1. Allez sur [render.com](https://render.com) → **New → PostgreSQL**
2. Nom : `pauline-db`
3. Plan : **Free**
4. Cliquez **Create Database**
5. Copiez l'**Internal Database URL** (vous en aurez besoin à l'étape 3)

---

## ÉTAPE 3 — Déployer le backend Django

1. **New → Web Service**
2. Connectez votre repo `pauline-api`
3. Paramètres :
   - **Name** : `pauline-api`
   - **Runtime** : `Python 3`
   - **Build Command** : `./build.sh`
   - **Start Command** : `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
4. **Variables d'environnement** (onglet Environment) :
   ```
   SECRET_KEY        = une-clé-longue-aléatoire-ici-minimum-50-caractères
   DEBUG             = False
   DATABASE_URL      = (coller l'Internal URL de l'étape 2)
   ```
5. Cliquez **Create Web Service**
6. Attendez le déploiement (~3 minutes)
7. Notez l'URL : `https://pauline-api.onrender.com`

---

## ÉTAPE 4 — Déployer le frontend React

1. **New → Static Site**
2. Connectez votre repo `pauline-front`
3. Paramètres :
   - **Name** : `pauline-boutique`
   - **Build Command** : `npm install && npm run build`
   - **Publish Directory** : `dist`
4. **Variables d'environnement** :
   ```
   VITE_API_URL = https://pauline-api.onrender.com
   ```
5. Cliquez **Create Static Site**

⚠️ **Important** : Après le déploiement du frontend, copiez son URL
(ex: `https://pauline-boutique.onrender.com`) et retournez dans le
backend → Environment → ajoutez :
```
FRONTEND_URL = https://pauline-boutique.onrender.com
```

---

## ÉTAPE 5 — Tester

- Frontend : `https://pauline-boutique.onrender.com`
- API : `https://pauline-api.onrender.com/api/produits/`
- Admin Django : `https://pauline-api.onrender.com/django-admin/`

Compte admin créé automatiquement :
- **Email** : admin@pauline.com
- **Mot de passe** : Admin@1234

---

## 💻 Test en local (sans Render, sans XAMPP)

```bash
# Backend
cd pauline_django
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
python manage.py migrate        # Crée db.sqlite3 automatiquement
python manage.py shell < boutique/fixtures_init.py
python manage.py runserver 8000

# Frontend (autre terminal)
cd pauline
npm install
npm run dev
```

Ouvrez `http://localhost:5173` — ça marche sans XAMPP, sans MySQL !
SQLite est utilisé automatiquement en local.

---

## ⚠️ Note sur les images en production

Render supprime les fichiers uploadés à chaque redéploiement (disque éphémère).
Pour les images permanentes, configurez **Cloudinary** ou **AWS S3**.
Pour commencer, les images du dossier `public/images/` sont servies par le frontend React.
