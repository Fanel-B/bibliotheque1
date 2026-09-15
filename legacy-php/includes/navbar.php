<header>
  <h1>Bienvenue sur la Bibliothèque Domotique</h1>
  <nav>
    <ul>
      <li><a href="/index.php">Accueil</a></li>
      <li><a href="/pages/livres.php">Livres</a></li>
      <li><a href="/pages/salle.php">Salle</a></li>
      <li><a href="/pages/contact.php">Contact</a></li>
    </ul>
  </nav>
  <?php if (isset($_SESSION['utilisateur'])): ?>
  <p>
    Connecté en tant que <strong>
      <?php echo $_SESSION['employe'] ? 'Employé' : 'Utilisateur'; ?>
    </strong>
  </p>
<?php endif; ?>

</header>

