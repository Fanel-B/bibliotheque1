
<?php
session_start();
if (!isset($_SESSION['utilisateur']) || !$_SESSION['employe']) {
  header("Location: login.php");
  exit;
}

include '../includes/header.php';
include '../config.php';

// Récupération des capteurs
$capteurs = $pdo->query("SELECT * FROM CAPTEUR")->fetchAll();
?>

<div class="container">
  <h2>📡 Liste des capteurs installés</h2>

  <?php foreach ($capteurs as $capteur): ?>
    <div class="capteur-box">
      <h3><?= htmlspecialchars($capteur['type_capteur']) ?></h3>
      <p><strong>Emplacement :</strong> <?= htmlspecialchars($capteur['emplacement']) ?></p>

      <p><strong>Température :</strong> <?= $capteur['valeur_temperature'] ?? '--' ?> °C</p>
      <p><strong>Humidité :</strong> <?= $capteur['valeur_humidite'] ?? '--' ?> %</p>
      <p><strong>Luminosité :</strong> <?= $capteur['valeur_luminosite'] ?? '--' ?> lux</p>

      <p><strong>Dernière mise à jour :</strong> <?= $capteur['date_maj'] ?? 'Inconnue' ?></p>
    </div>
  <?php endforeach; ?>
</div>

<?php include '../includes/footer.php'; ?>
