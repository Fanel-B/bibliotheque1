<?php
session_start();
include '../includes/header.php';
include '../includes/config.php';

$id_utilisateur = $_SESSION['utilisateur']['id_utilisateur'];

$sql = "SELECT l.titre, c.date_consultation 
        FROM consulter c
        JOIN exemplaire e ON c.id_exemplaire = e.id_exemplaire
        JOIN livre l ON e.id_livre = l.id_livre
        WHERE c.id_utilisateur = ?";
$stmt = $bdd->prepare($sql);
$stmt->execute([$id_utilisateur]);
$consultations = $stmt->fetchAll();
?>

<div class="container">
  <h2>📖 Mes livres consultés</h2>

  <?php if ($consultations): ?>
    <ul style="list-style:none; padding:0;">
      <?php foreach ($consultations as $c): ?>
        <li class="dashboard-box">
          <strong><?= htmlspecialchars($c['titre']) ?></strong><br>
          Consulté le : <?= htmlspecialchars($c['date_consultation']) ?>
        </li>
      <?php endforeach; ?>
    </ul>
  <?php else: ?>
    <p>Vous n’avez consulté aucun livre pour le moment.</p>
  <?php endif; ?>
</div>

<?php include '../includes/footer.php'; ?>
