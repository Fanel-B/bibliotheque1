<?php 
include '../includes/header.php';
include '../scripts/domoticz_api.php';
$config = include '../includes/config_equipements.php';
?>

<h2 style="margin-top:30px;">Tableau de bord – Employé</h2>

<div class="container" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; margin: 30px auto; max-width: 1200px;">
<?php foreach ($config as $device): ?>
  <div class="dashboard-box">
    <h3><?= htmlspecialchars($device['name']) ?></h3>
    <span class="badge badge-type"><?= htmlspecialchars($device['type']) ?></span>
    <div id="etat_<?= $device['idx'] ?>" class="capteur-box">Chargement...</div>

    <?php if (in_array($device['type'], ['Switch', 'Guidance'])): ?>
      <button onclick="switchDevice(<?= $device['idx'] ?>, 'On')">Allumer</button>
      <button onclick="switchDevice(<?= $device['idx'] ?>, 'Off')">Éteindre</button>
    <?php endif; ?>
  </div>
<?php endforeach; ?>
</div>

<script>
function getDeviceData(idx) {
  fetch('../scripts/domoticz_api.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `action=getData&idx=${idx}`
  })
  .then(res => res.json())
  .then(data => {
    const el = document.getElementById(`etat_${idx}`);
    if (data.result && data.result[0]) {
      el.innerText = "Valeur : " + data.result[0].Data;
      el.style.color = "#4CAF50";
    } else {
      el.innerText = "Non disponible";
      el.style.color = "red";
    }
  })
  .catch(() => {
    document.getElementById(`etat_${idx}`).innerText = "Erreur de récupération";
  });
}

function switchDevice(idx, command) {
  fetch('../scripts/domoticz_api.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `action=switch${command}&idx=${idx}`
  })
  .then(() => getDeviceData(idx));
}

<?php foreach ($config as $device): ?>
  getDeviceData(<?= $device['idx'] ?>);
<?php endforeach; ?>
</script>

<?php include '../includes/footer.php'; ?>
