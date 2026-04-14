<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Inscription</title>
  <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>

<?php include '../includes/header.php'; ?>

<div class="login-container">
  <h2>Inscription</h2>
  <p>Choisissez votre type de compte :</p>

  <div class="role-selection">
    <a href="register_utilisateur.php">
      <div class="role-container">Je suis un utilisateur</div>
    </a>
    <a href="register_employe.php">
      <div class="role-container">Je suis un employé</div>
    </a>
  </div>

  <button class="back-button" onclick="window.location.href='../index.php';">Retour</button>
</div>

<?php include '../includes/footer.php'; ?>
</body>
</html>
