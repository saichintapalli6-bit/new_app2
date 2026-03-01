#!/usr/bin/env bash
# Build script for Render.com

set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input --settings=Smart_Vehicle_Procurement_System_using_Blockchain_Technology.settings_production

python manage.py migrate --settings=Smart_Vehicle_Procurement_System_using_Blockchain_Technology.settings_production
