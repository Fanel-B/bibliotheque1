<?php
session_start();
include '../includes/header.php';
include '../includes/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $nom = htmlspecialchars($_POST['nom']);
  $message = htmlspecialchars($_POST['message']);

  $stmt = $bdd->prepare("INSERT INTO avis (nom, message, date_avis) VALUES (?, ?, NOW())");
  $stmt->execute([$nom, $message]);

  echo "<p style='color:green;'>Merci pour votre avis !</p>";
}
?>

<div class="container">
  <h2>💬 Laisser un avis</h2>
  <form method="POST" style="max-width: 500px; margin:auto;">
    <input type="text" name="nom" placeholder="Votre nom" required><br><br>
    <textarea name="message" rows="5" placeholder="Votre avis..." style="width:100%;" required></textarea><br><br>
    <button type="submit">Envoyer</button>
  </form>
</div>

<?php include '../includes/footer.php'; ?>
