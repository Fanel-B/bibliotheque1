
-- CREATEBASE.SQL : Création de la structure de la base de données BiblioTech

CREATE DATABASE IF NOT EXISTS bibliothequedomotique;
USE bibliothequedomotique;

-- Table des utilisateurs
CREATE TABLE UTILISATEUR (
  id_utilisateur INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(50),
  prenom VARCHAR(50),
  email VARCHAR(100) UNIQUE,
  mdp VARCHAR(255),
  datedenaissance DATE
);

-- Table des employés
CREATE TABLE EMPLOYE (
  id_employe INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(50),
  email VARCHAR(100) UNIQUE,
  mdp VARCHAR(255)
);

-- Table des auteurs
CREATE TABLE AUTEUR (
  id_auteur INT AUTO_INCREMENT PRIMARY KEY,
  nom_auteur VARCHAR(100),
  image VARCHAR(255)
);

-- Table des genres
CREATE TABLE GENRE (
  id_genre INT AUTO_INCREMENT PRIMARY KEY,
  libelle VARCHAR(100)
);

-- Table des livres
CREATE TABLE LIVRE (
  id_livre INT AUTO_INCREMENT PRIMARY KEY,
  titre VARCHAR(255),
  format VARCHAR(50),
  taille VARCHAR(50)
);

-- Table des relations LIVRE - AUTEUR
CREATE TABLE ECRIT_PAR (
  id_livre INT,
  id_auteur INT,
  PRIMARY KEY (id_livre, id_auteur),
  FOREIGN KEY (id_livre) REFERENCES LIVRE(id_livre),
  FOREIGN KEY (id_auteur) REFERENCES AUTEUR(id_auteur)
);

-- Table des relations LIVRE - GENRE
CREATE TABLE CLASSER (
  id_livre INT,
  id_genre INT,
  PRIMARY KEY (id_livre, id_genre),
  FOREIGN KEY (id_livre) REFERENCES LIVRE(id_livre),
  FOREIGN KEY (id_genre) REFERENCES GENRE(id_genre)
);

-- Table des exemplaires
CREATE TABLE EXEMPLAIRE (
  id_exemplaire INT AUTO_INCREMENT PRIMARY KEY,
  etat VARCHAR(50),
  disponibilite BOOLEAN,
  id_livre INT,
  FOREIGN KEY (id_livre) REFERENCES LIVRE(id_livre)
);

-- Table des prêts
CREATE TABLE PRETER (
  id_utilisateur INT,
  id_exemplaire INT,
  dateipret DATE,
  datefpret DATE,
  PRIMARY KEY (id_utilisateur, id_exemplaire, dateipret),
  FOREIGN KEY (id_utilisateur) REFERENCES UTILISATEUR(id_utilisateur),
  FOREIGN KEY (id_exemplaire) REFERENCES EXEMPLAIRE(id_exemplaire)
);

-- Table des consultations
CREATE TABLE CONSULTER (
  id_utilisateur INT,
  id_exemplaire INT,
  date_consultation DATE,
  PRIMARY KEY (id_utilisateur, id_exemplaire, date_consultation),
  FOREIGN KEY (id_utilisateur) REFERENCES UTILISATEUR(id_utilisateur),
  FOREIGN KEY (id_exemplaire) REFERENCES EXEMPLAIRE(id_exemplaire)
);

-- Table des salles
CREATE TABLE SALLE (
  id_salle INT AUTO_INCREMENT PRIMARY KEY,
  nom_salle VARCHAR(100),
  capacite INT
);

-- Table du calendrier
CREATE TABLE CALENDRIER (
  id_calendrier INT AUTO_INCREMENT PRIMARY KEY,
  date_reservation DATE,
  heure_debut TIME,
  heure_fin TIME
);

-- Table des réservations
CREATE TABLE RESERVER (
  id_utilisateur INT,
  id_salle INT,
  id_calendrier INT,
  PRIMARY KEY (id_utilisateur, id_salle, id_calendrier),
  FOREIGN KEY (id_utilisateur) REFERENCES UTILISATEUR(id_utilisateur),
  FOREIGN KEY (id_salle) REFERENCES SALLE(id_salle),
  FOREIGN KEY (id_calendrier) REFERENCES CALENDRIER(id_calendrier)
);

-- Table des équipements
CREATE TABLE EQUIPEMENT (
  id_equipement INT AUTO_INCREMENT PRIMARY KEY,
  type_equipement VARCHAR(100),
  etat VARCHAR(50)
);

-- INSTALLER (salle - équipement)
CREATE TABLE INSTALLER (
  id_salle INT,
  id_equipement INT,
  PRIMARY KEY (id_salle, id_equipement),
  FOREIGN KEY (id_salle) REFERENCES SALLE(id_salle),
  FOREIGN KEY (id_equipement) REFERENCES EQUIPEMENT(id_equipement)
);

-- Table des capteurs
CREATE TABLE CAPTEUR (
  id_capteur INT AUTO_INCREMENT PRIMARY KEY,
  type_capteur VARCHAR(100),
  emplacement VARCHAR(100)
);

CREATE TABLE DETECTER (
  id_capteur INT,
  id_salle INT,
  date_détection DATE,
  PRIMARY KEY (id_capteur, id_salle, date_détection),
  FOREIGN KEY (id_capteur) REFERENCES CAPTEUR(id_capteur),
  FOREIGN KEY (id_salle) REFERENCES SALLE(id_salle)
);

-- Historique des capteurs
CREATE TABLE HISTORIQUE_CAPTEUR (
  id_histo INT AUTO_INCREMENT PRIMARY KEY,
  id_capteur INT,
  type_mesure VARCHAR(50),
  valeur FLOAT,
  date_heure DATETIME,
  FOREIGN KEY (id_capteur) REFERENCES CAPTEUR(id_capteur)
);

-- Dispositifs domotiques
CREATE TABLE DISPOSITIF_DOMOTIQUE (
  id_dispositif INT AUTO_INCREMENT PRIMARY KEY,
  type_dispositif VARCHAR(100),
  salle INT,
  statut VARCHAR(50),
  FOREIGN KEY (salle) REFERENCES SALLE(id_salle)
);

-- Tables d'historiques spécifiques (exemples seulement pour 2)
CREATE TABLE HISTO_MULTISENSOR (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_dispositif INT,
  temperature FLOAT,
  humidite FLOAT,
  luminosite FLOAT,
  uv INT,
  mouvement BOOLEAN,
  vibration BOOLEAN,
  date_heure DATETIME,
  FOREIGN KEY (id_dispositif) REFERENCES DISPOSITIF_DOMOTIQUE(id_dispositif)
);

CREATE TABLE HISTO_WALLPLUG (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_dispositif INT,
  etat VARCHAR(10),
  consommation_w FLOAT,
  energie_totale_kwh FLOAT,
  date_heure DATETIME,
  FOREIGN KEY (id_dispositif) REFERENCES DISPOSITIF_DOMOTIQUE(id_dispositif)
);
