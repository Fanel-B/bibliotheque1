
<?php
session_start();
include '../config.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $email = $_POST['email'];
  $mdp = $_POST['mdp'];

  // Requête sans vérification chiffrée
  $stmt = $pdo->prepare("SELECT * FROM UTILISATEUR WHERE email = ? AND mdp = ?");
  $stmt->execute([$email, $mdp]);
  $user = $stmt->fetch();

  if ($user) {
    $_SESSION['utilisateur'] = $user;

    // Vérifie s’il est aussi un employé
    $stmt2 = $pdo->prepare("SELECT * FROM EMPLOYE WHERE id_employe = ?");
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

$_SESSION['erreur_login'] = "Email ou mot de passe incorrect.";
header("Location: ../pages/login.php");
exit;

?>