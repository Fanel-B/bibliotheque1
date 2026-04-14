<?php
session_start();
include '../config.php';

$inscription_reussie = false;

// Récupération des départements pour le menu déroulant
$departements = $pdo->query("SELECT * FROM DEPARTEMENT")->fetchAll();

if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $nom = $_POST['nom'];
  $prenom = $_POST['prenom'];
  $email = $_POST['email'];
  $mdp = $_POST['mdp'];
  $datedenaissance = $_POST['datedenaissance'];
  $id_departement = $_POST['id_departement'];

  // Insertion dans UTILISATEUR
  $stmt = $pdo->prepare("INSERT INTO UTILISATEUR (nom, prenom, email, mdp, datedenaissance) VALUES (?, ?, ?, ?, ?)");
  $stmt->execute([$nom, $prenom, $email, $mdp, $datedenaissance]);
  $id_utilisateur = $pdo->lastInsertId();

  // Lier à EMPLOYE
  $stmt2 = $pdo->prepare("INSERT INTO EMPLOYE (id_employe, id_departement) VALUES (?, ?)");
  $stmt2->execute([$id_utilisateur, $id_departement]);

  $inscription_reussie = true;
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Inscription - Employé</title>
  <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>

<?php include '../includes/header.php'; ?>

<div class="login-container">
  <h2>Inscription Employé</h2>

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

      <select name="id_departement" required>
        <option value="">-- Choisir un département --</option>
        <?php foreach ($departements as $d): ?>
          <option value="<?= $d['id_departement'] ?>"><?= htmlspecialchars($d['nom_departement']) ?></option>
        <?php endforeach; ?>
      </select>

      <button type="submit">S'inscrire</button>
    </form>
  <?php endif; ?>

  <button class="back-button" onclick="window.location.href='register.php';">Retour</button>
</div>

<?php include '../includes/footer.php'; ?>
</body>
</html>
