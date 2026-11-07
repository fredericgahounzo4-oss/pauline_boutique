PAULINE BOUTIQUE — CONFIGURATION EMAILJS

Dans Render > service backend > Environment, définir :
- EMAILJS_SERVICE_ID : identifiant du service EmailJS
- EMAILJS_TEMPLATE_ID : identifiant du modèle EmailJS
- EMAILJS_PUBLIC_KEY : clé publique EmailJS (User ID)
- FRONTEND_URL : https://pauline-boutique1.onrender.com

Dans le modèle EmailJS :
- champ destinataire / To Email : {{to_email}}
- nom destinataire (si utilisé) : {{to_name}}
- lien du bouton ou du message : {{reset_link}}
- nom de boutique (si utilisé) : {{app_name}}

Le backend appelle EmailJS. Ne pas remettre ces identifiants dans les variables VITE_
ni exposer le jeton de réinitialisation au navigateur. Le lien expire après 30 minutes
et ne peut être utilisé qu'une seule fois.

Commande de démarrage Render habituelle :
python manage.py migrate && python manage.py collectstatic --noinput && python manage.py seed_data && gunicorn pauline_api.wsgi:application
