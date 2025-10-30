"""Flask app entry point"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from storage import save_data, read_data

app = Flask(__name__)
CORS(app)

DATA_STORAGE = os.path.join("data", "devices.json")
DATA_CONTENT = read_data(DATA_STORAGE)

# Vérifications à faire :
# type : actuator ou sensor
# id : unique et non vide
# nom : non vide
# retour d'erreurs HTTP 400 avec messages explicites

def search_device(device_id):
    for device in DATA_CONTENT:
        if device["id"] == device_id:
            return device
    return {}


def update_device(device_id, values: dict):

    result = {"success": False, "reason": "device or key not found"}
    for device in DATA_CONTENT:
        if device["id"] == device_id:
            for k, v in values.items():
                if k in device:
                    device[k] = v
                    result = {"success": True,}
            save_data(DATA_STORAGE, DATA_CONTENT)
    return result


@app.route("/api/devices", methods=["GET", "POST"])
def get_devices():
    # Get all devices
    if request.method == "GET":
        result = []
        for device in DATA_CONTENT:
            result.append(device)
        return jsonify(result)
    
    # Add a new device
    if request.method == "POST":
        # améliorer en vérifiant ce qu'on passe 
        DATA_CONTENT.append(request.get_json())
        save_data(DATA_STORAGE, DATA_CONTENT)
        return jsonify({"success": True})


@app.route("/api/devices/<device_id>", methods=["GET", "DELETE", "PUT"])
def get_device(device_id):
    # Get device infos
    if request.method == "GET":
        return jsonify(search_device(device_id))
    
    # Update device infos
    if request.method == "PUT":
        return jsonify(update_device(device_id, request.get_json()))

    # Delete device
    if request.method == "DELETE":
        for index, device in enumerate(DATA_CONTENT):
            if device["id"] == device_id:
                DATA_CONTENT.pop(index)
                save_data(DATA_STORAGE, DATA_CONTENT)
                break
        return jsonify({"success": True})


@app.route("/api/devices/<device_id>/read")
def read_device(device_id):
    device = search_device(device_id)
    if "value" in device:
        result = {"value": device["value"]}
        return jsonify(result)
    return jsonify({})


@app.route("/api/devices/<device_id>/write", methods=["POST"])
def write_device(device_id):
    json_data = request.get_json()
    device = search_device(device_id)
    return jsonify(update_device(device["id"], json_data)) 


if __name__ == "__main__":
    app.run(debug=True)
