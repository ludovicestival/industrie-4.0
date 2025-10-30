// ---- Manipulations du DOM ---- //

function createForm(deviceId, data) {
  const form = document.createElement('form');
  form.id = 'edit-form';

  form.innerHTML = `
      <label for="name">Nom :</label>
      <input type="text" id="name" name="name" value="${data.name}" required>

      <label for="type">Type :</label>
        <select name="type" id="type" required>
            <option value="Actuator">Actuator</option>
            <option value="Sensor">Sensor</option>
        </select>

      <label for="location">Emplacement :</label>
      <input type="text" id="location" name="location" value="${data.location}" required>

      <button type="submit">Enregistrer</button>
    `;

  // Ajout du comportement du formulaire
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Récupérer les valeurs avec FormData
    const formData = new FormData(form);
    const updatedDevice = Object.fromEntries(formData.entries());

    await fetch(`http://localhost:5000/api/devices/${deviceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedDevice)
    })
      .then(response => {
        if (!response.ok) throw new Error('Erreur HTTP: ' + response.status);
        return response.json();
      })
      .then(data => {
        console.log('Réponse de l\'API:', data);
      })
      .catch(error => {
        console.error('Erreur:', error);
      });


    // Fermer la modale après soumission
    closeModal();
    await getDevices();
  });

  return form;
}

function openModal(deviceId, name, type, location) {
  const formContainer = document.getElementById('modal-form-container');
  formContainer.innerHTML = '';
  const data = {
    name: name,
    type: type,
    location: location
  }
  const form = createForm(deviceId, data);
  formContainer.appendChild(form);
  modal.style.display = 'block';
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.style.display = 'none';
}

function fillDevicesTable(data) {
  const devicesTable = document.getElementById("devices-table");

  devicesTable.innerHTML =
    `<tr>
    <th>Identifiant</th>
    <th>Nom</th>
    <th>Type</th>
    <th>Location</th>
    <th>Valeur</th>
    <th>Etat</th>
    <th>Actions</th>
    <th>Supprimer</th>
    <th>Modifier</th>
  </tr>`;

  data.forEach(device => {
    let val = device.value || '';
    let state = device.state || '';
    let row = document.createElement('tr');

    row.innerHTML = `
      <td>${device.id}</td>
      <td>${device.name}</td>
      <td>${device.type}</td>
      <td>${device.location}</td>
      <td>${val}</td>
      <td>${state}</td>
      <td id="${device.id}-action"></td>
      <td id="${device.id}-delete"></td>
      <td id="${device.id}-edit"></td>
    `;

    // Edit button
    const editButton = document.createElement('button');
    editButton.textContent = "Modifier";
    editButton.addEventListener('click', () => {
      openModal(device.id ,device.name, device.type, device.location);
    });
    row.querySelector(`#${device.id}-edit`).appendChild(editButton);

    // Delete button

    const deleteButton = document.createElement('button');
    deleteButton.textContent = "Supprimer";
    deleteButton.addEventListener('click', async () => {
      if (confirm("Supprimer ?")) {
        await deleteDevice(device.id);
        getDevices();
      }
    });

    row.querySelector(`#${device.id}-delete`).appendChild(deleteButton);

    // Ajouter un bouton au tableau si c'est un "LED"
    if (device.id.toLowerCase().includes('led')) {
      const newValue = device.state === 'on' ? 'off' : 'on';
      const buttonText = device.state === 'on' ? 'Eteindre' : 'Allumer';

      const button = document.createElement('button');
      button.textContent = buttonText;

      button.addEventListener('click', async () => {
        await writeDeviceField(device.id, { "state": newValue });
        getDevices();
      });

      // Ajouter le bouton à la cellule correspondante
      row.querySelector(`#${device.id}-action`).appendChild(button);
    }

    // Ajouter la ligne à la table
    devicesTable.appendChild(row);
  });
}

// ---- Communications avec l'API ---- //

async function getDevices() {
  await fetch('http://localhost:5000/api/devices')
    .then(response => {
      if (!response.ok) {
        throw new Error('Erreur HTTP: ' + response.status);
      }
      return response.json();
    })
    .then(data => {
      fillDevicesTable(data);
    })
    .catch(error => {
      console.error('Erreur:', error);
    });
}

async function deleteDevice(deviceId) {
  await fetch(`http://localhost:5000/api/devices/${deviceId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  })
    .then(response => response.json())
    .then(data => console.log('Réponse serveur:', data))
    .catch(error => console.error('Erreur:', error));
}

async function addDevice(data) {
  await fetch('http://localhost:5000/api/devices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(data => console.log('Réponse serveur:', data))
    .catch(error => console.error('Erreur:', error));
}

async function writeDeviceField(deviceId, postData) {
  await fetch(`http://localhost:5000/api/devices/${deviceId}/write`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(postData)
  })
    .then(response => {
      if (!response.ok) throw new Error('Erreur HTTP: ' + response.status);
      return response.json();
    })
    .then(data => {
      console.log('Réponse de l\'API:', data);
    })
    .catch(error => {
      console.error('Erreur:', error);
    });
}

// ---- Point d'entrée ---- //

document.addEventListener('DOMContentLoaded', async () => {
  // Load all devices
  await getDevices();

  // Form to create a device
  const form = document.getElementById('device-form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const deviceData = Object.fromEntries(formData.entries());
    await addDevice(deviceData);
    await getDevices();
  })

  // Modal
  const closeBtn = document.querySelector('.close');
  closeBtn.addEventListener('click', closeModal)
});
