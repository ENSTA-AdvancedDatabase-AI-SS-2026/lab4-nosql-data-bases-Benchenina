// TP4 - Exercice 3 : Algorithmes de Graphe avec GDS [cite: 10]

// ─── 3.1 : Plus court chemin [cite: 11, 12] ──────────────────────────────────
// "Comment Ahmed peut-il rencontrer Yasmina ?"
MATCH p = shortestPath(
  (a:Etudiant {prenom: "Ahmed"})-[:CONNAIT*..10]-(b:Etudiant {prenom: "Yasmina"})
)
RETURN [n IN nodes(p) | n.prenom + " (" + n.universite + ")"] AS chemin,
       length(p) AS nb_intermediaires;

// ─── 3.2 : Centralité de degré [cite: 13] ─────────────────────────────────────
// Création de la projection en mémoire
CALL gds.graph.project(
  'reseau_social',
  'Etudiant',
  {
    CONNAIT: { orientation: 'UNDIRECTED' }
  }
);

// Top 10 des étudiants les plus connectés [cite: 14]
CALL gds.degree.stream('reseau_social')
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).prenom AS etudiant,
       gds.util.asNode(nodeId).universite AS universite,
       score AS nb_connexions
ORDER BY score DESC
LIMIT 10;

// ─── 3.3 : Détection de communautés (Louvain) [cite: 15] ──────────────────────
CALL gds.louvain.stream('reseau_social')
YIELD nodeId, communityId
WITH communityId, collect(gds.util.asNode(nodeId).prenom) AS membres
RETURN communityId,
       size(membres) AS taille,
       membres[0..5] AS exemple_membres
ORDER BY taille DESC;

// ─── 3.4 : Recommandation de contacts [cite: 16, 17] ──────────────────────────
// Score = nb_amis_communs * 3 + nb_cours_communs * 2 + (meme_filiere ? 1 : 0)
MATCH (moi:Etudiant {prenom: "Ahmed"})
MATCH (suggestion:Etudiant)
WHERE suggestion <> moi AND NOT (moi)-[:CONNAIT]-(suggestion)

// Amis en commun
OPTIONAL MATCH (moi)-[:CONNAIT]-(ami)-[:CONNAIT]-(suggestion)
WITH moi, suggestion, count(distinct ami) AS amisCommuns

// Cours en commun
OPTIONAL MATCH (moi)-[:SUIT]->(c)<-[:SUIT]-(suggestion)
WITH moi, suggestion, amisCommuns, count(distinct c) AS coursCommuns

// Calcul du score final [cite: 18]
WITH suggestion, 
     (amisCommuns * 3 + coursCommuns * 2 + (CASE WHEN suggestion.filiere = "Informatique" THEN 1 ELSE 0 END)) AS score
WHERE score > 0
RETURN suggestion.prenom AS suggestion, score
ORDER BY score DESC
LIMIT 5;

// ─── 3.5 : Chemin de compétences [cite: 19] ───────────────────────────────────
// "Quels cours mènent à Machine Learning ?"
MATCH path = (c:Cours)-[:REQUIERT]->(comp:Competence {nom: "Machine Learning"})
RETURN [n IN nodes(path) | 
  CASE WHEN n:Cours THEN n.intitule ELSE n.nom END [cite: 20]
] AS parcours_apprentissage;

// Nettoyage de la projection GDS
CALL gds.graph.drop('reseau_social');