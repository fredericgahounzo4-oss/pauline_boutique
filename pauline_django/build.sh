#!/usr/bin/env bash
# Script de déploiement automatique sur Render
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate
python manage.py shell < boutique/fixtures_init.py
