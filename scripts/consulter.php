<?php
session_start();
include '../config.php';

if (!isset($_SESSION['utilisateur']) || !isset($_POST['id_exemplaire'])) {
  header("Location: ../pages/consultation.php");
  exit;
}

$id_utilisateur = $_SESSION['utilisateur']['id_utilisateur'];
$id_exemplaire = $_POST['id_exemplaire'];
$date = date("Y-m-d");

$stmt = $pdo->prepare("INSERT INTO CONSULTER (id_utilisateur, id_exemplaire, date_consultation) VALUES (?, ?, ?)");
$stmt->execute([$id_utilisateur, $id_exemplaire, $date]);

header("Location: ../pages/consultation.php");
exit;
?>
