import requests
import json

# L'URL de la route de ton API Flask
url = 'http://localhost:5000/api/devices/temp-001'

# Données à envoyer dans la requête POST
data = {
    "value": "test"
}

#response = requests.get(url)
#response = requests.post(url, json=data)
response = requests.put(url, json=data)
#response = requests.delete(url)


# Affichage de la réponse
if response.status_code == 200:
    print(response.text)
else:
    print(f"Erreur {response.status_code}: {response.text}")
