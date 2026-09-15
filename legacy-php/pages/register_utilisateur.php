<?php
session_start();
include '../config.php';

$inscription_reussie = false;

if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $nom = $_POST['nom'];
  $prenom = $_POST['prenom'];
  $email = $_POST['email'];
  $mdp = $_POST['mdp'];
  $datedenaissance = $_POST['datedenaissance'];

  // Insertion dans la table UTILISATEUR
  $stmt = $pdo->prepare("INSERT INTO UTILISATEUR (nom, prenom, email, mdp, datedenaissance) VALUES (?, ?, ?, ?, ?)");
  $stmt->execute([$nom, $prenom, $email, $mdp, $datedenaissance]);

  $inscription_reussie = true;
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Inscription - Utilisateur</title>
  <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>

<?php include '../includes/header.php'; ?>

<div class="login-container">
  <h2>Inscription Utilisateur</h2>

  <?php if ($inscription_reussie): ?>
    <p style="color: green; font-weight: bold;">✅ Inscription réussie !</p>
    <a href="login.php" class="btn">Se connecter</a>
  <?php else: ?>
    <form method="POST">
      <input type="text" name="nom" placeholder="Nom" required>
      <input type="text" name="prenom" placeholder="Prénom" required>
      <input type="email" name="email" placeholder="Adresse e-mail" required>
      <input type="password" name="mdp" placeholder="Mot de passe" required>
      <input type="date" name="datedenaissance" required>
      <button type="submit">S'inscrire</button>
    </form>
  <?php endif; ?>

  <button class="back-button" onclick="window.location.href='register.php';">Retour</button>
</div>

<?php include '../includes/footer.php'; ?>
</body>
</html>
