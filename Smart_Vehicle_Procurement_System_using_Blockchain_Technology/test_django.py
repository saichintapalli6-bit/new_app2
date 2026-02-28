import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Smart_Vehicle_Procurement_System_using_Blockchain_Technology.settings')
django.setup()

import sqlite3
import decimal

conn = sqlite3.connect('db.sqlite3')
cur = conn.cursor()
cur.execute('SELECT id, price FROM seller_vehicle')
rows = cur.fetchall()

def create_decimal(value):
    return decimal.Decimal(value)

for r in rows:
    try:
        val = str(r[1])
        d = create_decimal(val)
        d.quantize(decimal.Decimal('.01'))
    except Exception as e:
        print(f"ID: {r[0]} | Value: {repr(r[1])} | Exception: {e}")
