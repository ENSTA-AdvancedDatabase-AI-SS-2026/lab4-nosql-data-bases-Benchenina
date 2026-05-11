// TP4 - Exercice 1 : Création du graphe UniConnect DZ
// Effacer la base pour partir propre
MATCH (n) DETACH DELETE n;

// ─── 1.1 : Contraintes d'unicité ─────────────────────────────
CREATE CONSTRAINT etudiant_id IF NOT EXISTS FOR (e:Etudiant) REQUIRE e.id IS UNIQUE;
CREATE CONSTRAINT cours_code IF NOT EXISTS FOR (c:Cours) REQUIRE c.code IS UNIQUE;
CREATE CONSTRAINT competence_nom IF NOT EXISTS FOR (c:Competence) REQUIRE c.nom IS UNIQUE;
CREATE CONSTRAINT club_nom IF NOT EXISTS FOR (c:Club) REQUIRE c.nom IS UNIQUE;
CREATE CONSTRAINT entreprise_nom IF NOT EXISTS FOR (e:Entreprise) REQUIRE e.nom IS UNIQUE;

// ─── 1.2 : Créer les compétences ──────────────────────────────
UNWIND [
  {nom: "Python", categorie: "Programmation"},
  {nom: "Java", categorie: "Programmation"},
  {nom: "SQL", categorie: "Bases de Données"},
  {nom: "NoSQL", categorie: "Bases de Données"},
  {nom: "Machine Learning", categorie: "IA"},
  {nom: "Deep Learning", categorie: "IA"},
  {nom: "React", categorie: "Web"},
  {nom: "Docker", categorie: "DevOps"},
  {nom: "Linux", categorie: "Systèmes"},
  {nom: "Réseaux", categorie: "Infrastructure"}
] AS comp
MERGE (:Competence {nom: comp.nom, categorie: comp.categorie});

// ─── 1.3 : Créer les cours ────────────────────────────────────────────
UNWIND [
  {code: "INFO401", intitule: "Bases de Données Avancées", credits: 6, dept: "Informatique"},
  {code: "INFO402", intitule: "Intelligence Artificielle", credits: 6, dept: "Informatique"},
  {code: "INFO403", intitule: "Développement Web", credits: 4, dept: "Informatique"},
  {code: "INFO404", intitule: "Systèmes Distribués", credits: 5, dept: "Informatique"},
  {code: "INFO405", intitule: "Cloud Computing", credits: 4, dept: "Informatique"}
] AS cours
MERGE (c:Cours {code: cours.code})
SET c.intitule = cours.intitule, c.credits = cours.credits, c.departement = cours.dept;

// Ajouter les relations entre Cours et Compétences (pour Ex 3.5)
MATCH (c:Cours {code: "INFO401"}), (comp:Competence {nom: "SQL"}) MERGE (c)-[:REQUIERT]->(comp);
MATCH (c:Cours {code: "INFO402"}), (comp:Competence {nom: "Machine Learning"}) MERGE (c)-[:REQUIERT]->(comp);
MATCH (c:Cours {code: "INFO403"}), (comp:Competence {nom: "React"}) MERGE (c)-[:REQUIERT]->(comp);

// ─── 1.4 : Importation des Étudiants depuis CSV ──────────────────────────────
// Note: Utilisation du chemin spécifié par l'utilisateur
LOAD CSV WITH HEADERS FROM 'file:///import/students.csv' AS row
MERGE (e:Etudiant {id: row.id})
SET e.prenom = row.prenom,
    e.nom = row.nom,
    e.universite = row.universite,
    e.filiere = row.filiere,
    e.annee = toInteger(row.annee),
    e.ville = row.ville;

// ─── 1.5 : Création des Relations pour la Connexité ─────────────────

// Relations CONNAIT : Connecter les étudiants de la même université
MATCH (e1:Etudiant), (e2:Etudiant)
WHERE e1.id < e2.id AND e1.universite = e2.universite
MERGE (e1)-[:CONNAIT {depuis: 2023, contexte: "Université"}]-(e2);

// Relations SUIT : Assigner des cours selon la filière
MATCH (e:Etudiant {filiere: "Informatique"}), (c:Cours)
WHERE c.code IN ["INFO401", "INFO402", "INFO403"]
MERGE (e)-[:SUIT {semestre: 1, note: rand()*20}]->(c);

// Relations MAITRISE : Assigner des compétences aléatoires
MATCH (e:Etudiant), (comp:Competence)
WITH e, comp WHERE rand() > 0.7
MERGE (e)-[:MAITRISE {niveau: "Intermédiaire"}]->(comp);

// Vérification finale
MATCH (n) RETURN labels(n)[0] AS type, count(n) AS total ORDER BY total DESC;