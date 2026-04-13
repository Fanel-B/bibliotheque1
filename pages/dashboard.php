<?php
session_start();
if (!isset($_SESSION['utilisateur']) || $_SESSION['employe']) {
  header("Location: login.php");
  exit;
}
include '../includes/header.php';
?>

<div class="container">
  <h2 style="margin-top: 30px;">Bienvenue <?= htmlspecialchars($_SESSION['utilisateur']['prenom']) ?> 👋</h2>

  <div class="dashboard-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; padding: 40px;">

    <div class="dashboard-box">
      <h3>📖 Mes consultations</h3>
      <p>Consultez votre historique de lecture.</p>
      <a href="consultation.php" class="catalogue-btn">Voir</a>
    </div>

    <div class="dashboard-box">
      <h3>🗓️ Mes réservations</h3>
      <p>Réservez une salle d’étude en quelques clics.</p>
      <a href="reservation.php" class="catalogue-btn">Réserver</a>
    </div>

    <div class="dashboard-box">
      <h3>🔎 Catalogue de livres</h3>
      <p>Recherchez un livre par titre, auteur ou genre.</p>
      <a href="catalogue.php" class="catalogue-btn">Accéder</a>
    </div>

    <div class="dashboard-box">
      <h3>💬 Laisser un avis</h3>
      <p>Exprimez votre expérience avec Biblio-Tech.</p>
      <a href="avis.php" class="catalogue-btn">Donner un avis</a>
    </div>

    <div class="dashboard-box" style="grid-column: span 2;">
      <form action="../scripts/logout.php" method="POST">
        <button type="submit" class="back-button">Se déconnecter</button>
      </form>
    </div>

  </div>
</div>

<?php include '../includes/footer.php'; ?>
