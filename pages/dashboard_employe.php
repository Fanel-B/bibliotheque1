<?php
session_start();
if (!isset($_SESSION['utilisateur']) || !$_SESSION['employe']) {
  header("Location: login.php");
  exit;
}
?>

<h1>Espace employé</h1>
<p>Bienvenue ! Vous pouvez gérer les capteurs, consulter les données, etc.</p>
