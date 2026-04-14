<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Biblio-Tech - Accueil</title>
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<script src="assets/js/welcome.js"></script>

<body>

<?php include 'includes/header.php'; ?>


<div class="container">
  <div class="role-selection">
    <a href="pages/login.php"><div class="role-container">Connexion</div></a>
    <a href="pages/register.php"><div class="role-container">Inscription</div></a>
  </div>
</div>

<section class="hero">
  <div class="hero-content">
    <h2 id="welcome-text"></h2>
    <a href="pages/login.php" class="btn start-btn">Commencer</a>
  </div>
</section>
<section class="catalogue-section">
  <h2>📖 Accédez à notre catalogue</h2>
  <p>Explorez tous les livres disponibles dans la bibliothèque Biblio-Tech.</p>
  <a href="pages/consultation.php" class="btn catalogue-btn">Voir les livres</a>
</section>

<section class="mission-section">
  <h2>Notre Mission</h2>
  <p>
    Biblio-Tech vise à moderniser l'expérience en bibliothèque grâce à la technologie.  
    Nous rendons l'information accessible, l’environnement confortable et la culture vivante.
  </p>
</section>
<section class="features">
  <h2>Nouveautés de la bibliothèque</h2>
  <div class="feature-grid">

    <div class="feature-card">
      <img src="assets/img/nouveaux-livres.jpg" alt="Livres récents">
      <h3>Nouveaux livres ajoutés cette semaine</h3>
      <p class="feature-date">22 avril 2025</p>
      <p>Découvrez les derniers ajouts à notre collection. Ne manquez pas ces trésors littéraires !</p>
      <a href="#" class="btn feature-btn">VOIR</a>
    </div>

    <div class="feature-card">
      <img src="assets/img/salle-etude.jpg" alt="Salles d’étude">
      <h3>Réservations de salles d'étude</h3>
      <p class="feature-date">22 avril 2025</p>
      <p>Réservez votre espace d’étude dès maintenant et évitez les foules !</p>
      <a href="#" class="btn feature-btn">VOIR</a>
    </div>

    <div class="feature-card">
      <img src="assets/img/evenement.jpg" alt="Événements">
      <h3>Événements à venir à Biblio-Tech</h3>
      <p class="feature-date">22 avril 2025</p>
      <p>Participez à nos ateliers et conférences.Inscrivez-vous vite !!!!!!!!!!</p>
      <a href="#" class="btn feature-btn">VOIR</a>
    </div>

    <div class="feature-card">
      <img src="assets/img/statistiques.jpg" alt="Statistiques">
      <h3>Statistiques de lecture du mois</h3>
      <p class="feature-date">22 avril 2025</p>
      <p>Quels livres ont été les plus consultés ? Découvrez les tendances !</p>
      <a href="#" class="btn feature-btn">VOIR</a>
    </div>

  </div>
</section>
<section class="enviro-data">
  <h2>Conditions idéales dans votre bibliothèque</h2>
  <div class="enviro-grid">
    <div class="enviro-card">
      <h3>Température</h3>
      <p>22°C</p>
    </div>
    <div class="enviro-card">
      <h3>Humidité</h3>
      <p>45% contrôlée</p>
    </div>
    <div class="enviro-card">
      <h3>Lumière</h3>
      <p>Lumière parfaite</p>
    </div>
  </div>
</section>
<section class="avis-section">
  <h2>Ils parlent de Biblio-Tech</h2>
  <div class="avis-grid">
    <div class="avis-card">
      <p>"Un lieu apaisant, moderne et ultra accessible. J’ai adoré réserver ma salle sans stress !"</p>
      <h4>— Sarah L.</h4>
    </div>
    <div class="avis-card">
      <p>"La domotique en bibliothèque ? Excellente idée ! Merci pour l’innovation."</p>
      <h4>— Karim M.</h4>
    </div>
    <div class="avis-card">
      <p>"Le site est super simple à utiliser, et les livres sont très bien mis en avant."</p>
      <h4>— Julie R.</h4>
    </div>
  </div>
</section>
<section class="avis-section">
  <h2>Ils parlent de Biblio-Tech</h2>
  <div class="avis-grid">
    <div class="avis-card">
      <p>"Un lieu apaisant, moderne et ultra accessible. J’ai adoré réserver ma salle sans stress !"</p>
      <h4>— Sarah L.</h4>
    </div>
    <div class="avis-card">
      <p>"La domotique en bibliothèque ? Excellente idée ! Merci pour l’innovation."</p>
      <h4>— Karim M.</h4>
    </div>
    <div class="avis-card">
      <p>"Le site est super simple à utiliser, et les livres sont très bien mis en avant."</p>
      <h4>— Julie R.</h4>
    </div>
  </div>
</section>
<section class="faq-section">
  <h2>Questions Fréquentes</h2>
  <div class="faq-item">
    <h3>Comment réserver une salle d'étude ?</h3>
    <p>Connectez-vous avec votre compte utilisateur et cliquez sur “Réserver une salle” dans votre tableau de bord.</p>
  </div>
  <div class="faq-item">
    <h3>Comment consulter un livre en ligne ?</h3>
    <p>Depuis l’accueil, accédez au catalogue et utilisez la fonction “Consulter”. Certains livres sont disponibles en version numérique.</p>
  </div>
  <div class="faq-item">
    <h3>Je suis employé, comment accéder aux capteurs ?</h3>
    <p>Connectez-vous en tant que personnel et rendez-vous dans l’onglet “Capteurs” ou “Historique”.</p>
  </div>
</section>

<section class="social-section">
  <h2>Suivez-nous</h2>
  <div class="social-icons">
    <a href="#"><img src="assets/img/facebook.png" alt="Facebook"></a>
    <a href="#"><img src="assets/img/twitter.png" alt="Twitter"></a>
    <a href="#"><img src="assets/img/instagram.png" alt="Instagram"></a>
  </div>
</section>


<?php include 'includes/footer.php'; ?>

</body>
</html>

