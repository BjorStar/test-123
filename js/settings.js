function openSettings() {
  const modal = new bootstrap.Modal(document.getElementById('settingsModal'));
  modal.show();
}

function closeSettings() {
  const modalEl = document.getElementById('settingsModal');
  const modal = bootstrap.Modal.getInstance(modalEl);
  modal.hide();
}

function saveSettings() {
  const weatherKey = document.getElementById("weatherKeyInput").value;
  const aiKey = document.getElementById("aiKeyInput").value;

  if (weatherKey) {
    localStorage.setItem("weatherKey", weatherKey);
  }

  if (aiKey) {
    localStorage.setItem("apiKey", aiKey);
  }

  alert("Settings saved!");
  closeSettings();
}