import urllib.request
import urllib.error

try:
    with urllib.request.urlopen('http://localhost:8000/api/seller/vehicle-history') as res:
        print(res.read().decode())
except urllib.error.HTTPError as e:
    print(e.read().decode())
