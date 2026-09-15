<?php session_start(); ?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Connexion</title>
  <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>


<?php include '../includes/header.php'; ?>

<div class="login-container">
  <h2>Connexion</h2>

  <?php if (isset($_SESSION['erreur_login'])): ?>
    <p style="color: red; font-weight: bold;">
      <?php 
        echo $_SESSION['erreur_login']; 
        unset($_SESSION['erreur_login']); 
      ?>
    </p>
  <?php endif; ?>

  <form action="../scripts/login.php" method="POST">
    <input type="email" name="email" placeholder="Adresse e-mail" required>
    <input type="password" name="mdp" placeholder="Mot de passe" required>
    <button type="submit">Se connecter</button>
  </form>

  <button class="back-button" onclick="window.location.href='../index.php';">Retour</button>
</div>

<?php include '../includes/footer.php'; ?>
</body>
</html>
