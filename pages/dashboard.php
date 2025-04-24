<?php
session_start();
if (!isset($_SESSION['utilisateur']) || $_SESSION['employe']) {
  header("Location: login.php");
  exit;
}
?>

<h1>Bienvenue dans votre espace utilisateur !</h1>
<p>Vous pouvez consulter et réserver des livres.</p>
