<?php
session_start();
include '../includes/config.php';  // $bdd est défini ici

if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $email = $_POST['email'];
  $mdp = $_POST['mdp'];

  // Requête sans mot de passe hashé (simple pour test)
  $stmt = $bdd->prepare("SELECT * FROM utilisateur WHERE email = ? AND mdp = ?");
  $stmt->execute([$email, $mdp]);
  $user = $stmt->fetch();

  if ($user) {
    $_SESSION['utilisateur'] = $user;

    // Vérifie s’il est aussi un employé
    $stmt2 = $bdd->prepare("SELECT * FROM employe WHERE id_employe = ?");
    $stmt2->execute([$user['id_utilisateur']]);
    $employe = $stmt2->fetch();

    if ($employe) {
      $_SESSION['employe'] = true;
      header("Location: ../pages/dashboard_employe.php");
    } else {
      $_SESSION['employe'] = false;
      header("Location: ../pages/dashboard.php");
    }
    exit;
  } else {
    $_SESSION['erreur_login'] = "Email ou mot de passe incorrect.";
    header("Location: ../pages/login.php");
    exit;
  }
}
?>
