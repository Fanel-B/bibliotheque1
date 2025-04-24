<?php
session_start();
include "../config/database.php";

if (!isset($_SESSION["user_id"])) {
    header("Location: login.php");
    exit();
}

// Récupérer les capteurs
$stmt = $pdo->query("SELECT * FROM CAPTEUR");
$capteurs = $stmt->fetchAll();
?>
<h1>Liste des Capteurs</h1>
<table>
    <tr>
        <th>Type</th>
        <th>Emplacement</th>
        <th>Valeur</th>
    </tr>
    <?php foreach ($capteurs as $capteur) : ?>
        <tr>
            <td><?= $capteur["type_capteur"] ?></td>
            <td><?= $capteur["emplacement"] ?></td>
            <td><?= $capteur["valeur"] ?></td>
        </tr>
    <?php endforeach; ?>
</table>
<a href="dashboard.php">Retour</a>
