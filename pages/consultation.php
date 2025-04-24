<?php
session_start();
include '../config.php';
include '../includes/header.php';
include '../includes/navbar.php';
?>

<div class="container">
  <h2>Catalogue des Livres</h2>
  <div class="book-grid">

    <?php
    $query = $pdo->query("
      SELECT l.id_livre, l.titre, a.nom_auteur, e.disponibilite
      FROM LIVRE l
      JOIN AUTEUR a ON l.id_auteur = a.id_auteur
      JOIN EXEMPLAIRE e ON l.id_livre = e.id_livre
    ");

    while ($row = $query->fetch()) {
      echo "<div class='book-card'>";
      echo "<h3>" . htmlspecialchars($row['titre']) . "</h3>";
      echo "<p><strong>Auteur :</strong> " . htmlspecialchars($row['nom_auteur']) . "</p>";
      echo "<p><strong>Disponibilité :</strong> " . ($row['disponibilite'] ? "✅ Disponible" : "❌ Indisponible") . "</p>";
      if ($row['disponibilite']) {
        echo "<form method='POST' action='../scripts/consulter.php'>";
        echo "<input type='hidden' name='id_livre' value='" . $row['id_livre'] . "'>";
        echo "<button type='submit' class='btn'>Consulter</button>";
        echo "</form>";
      }
      echo "</div>";
    }
    ?>

  </div>
</div>

<?php include '../includes/footer.php'; ?>
