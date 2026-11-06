# Déploiement Render — Pauline Boutique

## Backend Django
- Root Directory : `pauline_api` (ou le dossier backend extrait).
- Build Command : `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
- Start Command : `gunicorn pauline_api.wsgi:application`
- Renseigner les variables de `.env.example` dans **Environment** sur Render. Ne jamais committer `.env`.
- `DATABASE_URL` doit pointer vers la base PostgreSQL de production.
- Pour l'e-mail, renseigner un compte SMTP réel. Avec Gmail, utiliser un mot de passe d'application, pas le mot de passe habituel.
- Créer le compte d'administration Django avec `python manage.py createsuperuser` dans le Shell Render.

## Frontend React/Vite
- Root Directory : `pauline` (ou le dossier frontend extrait).
- Build Command : `npm ci && npm run build`
- Publish Directory : `dist`
- Variables : `VITE_API_URL` (URL du backend), `VITE_FEDAPAY_PUBLIC_KEY` (clé publique seulement), `VITE_FEDAPAY_MODE` (`sandbox` pour les tests, `live` en production).
- Le fichier `public/_redirects` contient le proxy `/api/*` et le fallback SPA. Si votre hébergeur utilise un mécanisme de réécriture différent, configurez ces deux règles dans son tableau de bord.

## Important
- Ne mettez jamais `FEDAPAY_SECRET_KEY`, `SECRET_KEY`, `DATABASE_URL` ou un mot de passe SMTP dans les variables `VITE_*`. Les variables Vite sont intégrées au JavaScript public.
- Le flux de réinitialisation utilise désormais un jeton à usage unique généré et vérifié par Django et un e-mail SMTP envoyé par le backend. Sans SMTP configuré, la demande renverra une erreur 503.
- Le navigateur peut afficher des réponses 401 si l'adresse ou le mot de passe client est incorrect. Les erreurs 500 doivent être diagnostiquées dans les logs Render.

## Variables à retirer de l'ancien frontend
Les variables `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID` et `VITE_EMAILJS_PUBLIC_KEY` ne sont plus utilisées par le formulaire de mot de passe oublié : l'envoi du lien est maintenant effectué par Django via SMTP. Supprimez-les du service frontend après déploiement. N'y placez aucune clé privée.

## Limites à traiter avant une mise en production avec de vrais paiements
Le code de paiement fourni doit encore être complété par une vérification serveur-à-serveur de chaque transaction FedaPay à l'aide de `FEDAPAY_SECRET_KEY`. Ne considérez jamais le statut renvoyé uniquement par le navigateur comme une preuve de paiement. De même, protégez les routes `/api/admin/*` par une authentification et une autorisation administrateur côté serveur avant d'ouvrir le tableau de bord à Internet.
