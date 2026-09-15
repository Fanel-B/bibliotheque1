<?php
session_start();
if (!isset($_SESSION['utilisateur']) || $_SESSION['employe']) {
    header("Location: login.php");
    exit;
}

include '../includes/header.php';
include '../includes/config.php';

$message = "";

// Traitement du formulaire
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    if (
        isset($_POST['salle'], $_POST['date'], $_POST['heure_debut'], $_POST['heure_fin']) &&
        !empty($_POST['salle']) && !empty($_POST['date']) && !empty($_POST['heure_debut']) && !empty($_POST['heure_fin'])
    ) {
        $id_utilisateur = $_SESSION['utilisateur']['id_utilisateur'];
        $id_salle = $_POST['salle'];
        $date = $_POST['date'];
        $heure_debut = $_POST['heure_debut'];
        $heure_fin = $_POST['heure_fin'];

        try {
            $stmt = $bdd->prepare("INSERT INTO CALENDRIER (date_reservation, heure_debut, heure_fin) VALUES (?, ?, ?)");
            $stmt->execute([$date, $heure_debut, $heure_fin]);
            $id_calendrier = $bdd->lastInsertId();

            $stmt = $bdd->prepare("INSERT INTO RESERVER (id_utilisateur, id_salle, id_calendrier) VALUES (?, ?, ?)");
            $stmt->execute([$id_utilisateur, $id_salle, $id_calendrier]);

            $message = "✅ Réservation effectuée avec succès.";
        } catch (PDOException $e) {
            $message = "❌ Erreur : " . $e->getMessage();
        }
    } else {
        $message = "❌ Tous les champs sont requis.";
    }
}

// Récupération des salles
$salles = $bdd->query("SELECT * FROM SALLE")->fetchAll(PDO::FETCH_ASSOC);
?>

<div class="container" style="max-width: 600px; margin: 40px auto;">
  <h2 style="margin-bottom: 30px;">📚 Réserver une salle</h2>

  <?php if (!empty($message)): ?>
    <div style="margin-bottom: 20px; font-weight: bold; color: <?= str_starts_with($message, '✅') ? 'green' : 'red' ?>;">
      <?= $message ?>
    </div>
  <?php endif; ?>
<div style="margin-top: 20px;">
  <a href="dashboard.php" class="back-button" style="background-color: #e53935; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;">
    ⬅ Retour au tableau de bord
  </a>
</div>

  <form method="POST" style="background-color: #1e1e1e; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); color: white;">
    <label for="salle">Choisissez une salle :</label>
    <select name="salle" required style="width: 100%; padding: 10px; margin-bottom: 20px; border-radius: 8px;">
      <option value="">-- Sélectionnez une salle --</option>
      <?php foreach ($salles as $salle): ?>
        <option value="<?= $salle['id_salle'] ?>">
          <?= htmlspecialchars($salle['nom_salle']) ?> — Capacité : <?= $salle['capacité'] ?>
        </option>
      <?php endforeach; ?>
    </select>

    <label for="date">Date de réservation :</label>
    <input type="date" name="date" required style="width: 100%; padding: 10px; margin-bottom: 20px; border-radius: 8px;">

    <label for="heure_debut">Heure de début :</label>
    <input type="time" name="heure_debut" required style="width: 100%; padding: 10px; margin-bottom: 20px; border-radius: 8px;">

    <label for="heure_fin">Heure de fin :</label>
    <input type="time" name="heure_fin" required style="width: 100%; padding: 10px; margin-bottom: 30px; border-radius: 8px;">

    <button type="submit" class="back-button" style="width: 100%; background-color: #4CAF50;">Réserver maintenant</button>
  </form>
</div>

<?php include '../includes/footer.php'; ?>
