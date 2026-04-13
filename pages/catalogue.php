
<?php
include '../includes/header.php';
include '../includes/config.php'; 

?>

<div class="container">
  <h2 style="margin-top: 30px;">📚 Catalogue de Livres</h2>

  <!-- Barre de recherche -->
  <form method="GET" action="" style="margin: 30px auto; max-width: 600px;">
    <input type="text" name="q" placeholder="Rechercher un titre, un auteur ou un genre..." style="padding: 12px; width: 70%;">
    <button type="submit" style="padding: 12px 20px; background-color: #4CAF50; color: white; border: none;">Rechercher</button>
  </form>

  <div class="book-grid">
    <?php
    $search = isset($_GET['q']) ? trim($_GET['q']) : '';

    $sql = "SELECT l.*, a.nom_auteur, g.libelle AS genre
            FROM livre l
            JOIN ecrit_par ep ON l.id_livre = ep.id_livre
            JOIN auteur a ON a.id_auteur = ep.id_auteur
            JOIN etre_genre eg ON l.id_livre = eg.id_livre
            JOIN genre g ON g.id_genre = eg.id_genre
            WHERE l.titre LIKE :search OR a.nom_auteur LIKE :search OR g.libelle LIKE :search
            ORDER BY l.titre";

    $stmt = $bdd->prepare($sql);
    $stmt->execute(['search' => "%$search%"]);
    $livres = $stmt->fetchAll();

    if ($livres) {
      foreach ($livres as $livre) {
        echo "
        <div class='book-card'>
          <img src='../assets/img/{$livre['image']}' alt='{$livre['titre']}' style='width:100%; height:180px; object-fit:cover; border-radius:8px; margin-bottom:15px;'>
          <h3>{$livre['titre']}</h3>
          <p><strong>Auteur :</strong> {$livre['nom_auteur']}</p>
          <p><strong>Genre :</strong> {$livre['genre']}</p>
          <p><strong>Format :</strong> {$livre['format']} / {$livre['taille']}</p>
          <p><strong>Année :</strong> {$livre['annee_parution']}</p>
          <p style='min-height:60px; font-size:14px; color:#bbb;'>{$livre['description']}</p>
          <a href='#' class='catalogue-btn'>Voir</a>
        </div>";
      }
    } else {
      echo "<p style='text-align:center; margin-top:20px;'>Aucun livre trouvé.</p>";
    }
    ?>
  </div>
</div>

<?php include '../includes/footer.php'; ?>
