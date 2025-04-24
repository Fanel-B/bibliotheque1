
-- INSERTBASE.SQL : Insertion de données de test


INSERT INTO UTILISATEUR (nom, prenom, email, mdp, datedenaissance) VALUES
('Martin', 'Claire', 'claire@mail.com', 'usager123', '2001-05-12'),
('Robert', 'Julien', 'julien@mail.com', 'usager456', '1999-11-20');

INSERT INTO EMPLOYE (nom, email, mdp) VALUES
('Dubois', 'marie@mail.com', 'employe123'),
('Lefevre', 'hugo@mail.com', 'employe456');

INSERT INTO AUTEUR (nom_auteur, image) VALUES
('Antoine de Saint-Exupéry', 'antoine.jpg'),
('Jules Verne', 'jules.jpg');

INSERT INTO GENRE (libelle) VALUES
('Littérature'), ('Science'), ('Histoire');

INSERT INTO LIVRE (titre, format, taille) VALUES
('Le Petit Prince', 'papier', 'poche'),
('Voyage au centre de la Terre', 'numérique', 'standard');

INSERT INTO ECRIT_PAR VALUES (1, 1), (2, 2);
INSERT INTO CLASSER VALUES (1, 1), (2, 2);

INSERT INTO EXEMPLAIRE (etat, disponibilite, id_livre) VALUES
('bon', true, 1), ('neuf', false, 2);

INSERT INTO SALLE (nom_salle, capacite) VALUES
('Salle Lecture', 10), ('Salle Info', 15);

INSERT INTO CALENDRIER (date_reservation, heure_debut, heure_fin) VALUES
('2025-04-15', '10:00:00', '12:00:00');

INSERT INTO RESERVER VALUES (1, 1, 1);

INSERT INTO CAPTEUR (type_capteur, emplacement) VALUES
('Température', 'Salle Lecture'), ('Humidité', 'Salle Info');

INSERT INTO DISPOSITIF_DOMOTIQUE (type_dispositif, salle, statut) VALUES
('Multisensor 6', 1, 'actif'),
('Wall Plug', 2, 'actif');
