/**
 * TP2 - Exercice 4 : Index et Optimisation
 */

use("medical_db");

// ─── 4.1 : Créer les index appropriés ────────────────────────────────────────

// Index 1 : Recherche fréquente par wilaya + antécédents (Compound Index)
// Justification : Optimise les recherches filtrant par localisation et pathologie simultanément.
db.patients.createIndex({ "adresse.wilaya": 1, "antecedents": 1 });

// Index 2 : Recherche par date de consultation (Multikey Index)
// Justification : Accélère les tris et filtres temporels sur le tableau de consultations.
db.patients.createIndex({ "consultations.date": 1 });

// Index 3 : Texte sur diagnostics pour recherche full-text
// Justification : Permet des recherches par mots-clés sur les diagnostics médicaux.
db.patients.createIndex({ "consultations.diagnostic": "text" });

// Index 4 : Analyses par patient (lookup)
// Justification : Crucial pour les jointures ($lookup) entre patients et analyses.
db.analyses.createIndex({ "patient_id": 1 });


// ─── 4.2 : Comparer avec explain() ────────────────────────────────────────────

const requeteTest = {
  "adresse.wilaya": "Alger",
  antecedents: "Diabète type 2"
};

print("=== AVANT index ===");
// Note: To see the "BEFORE" stats, you would usually drop the index first:
// db.patients.dropIndex("adresse.wilaya_1_antecedents_1")
const explainAvant = db.patients.find(requeteTest).explain("executionStats");
printjson({
  nReturned: explainAvant.executionStats.nReturned,
  totalDocsExamined: explainAvant.executionStats.totalDocsExamined,
  executionTimeMillis: explainAvant.executionStats.executionTimeMillis
});

print("\n=== APRÈS index ===");
const explainApres = db.patients.find(requeteTest).explain("executionStats");
printjson({
  nReturned: explainApres.executionStats.nReturned,
  totalDocsExamined: explainApres.executionStats.totalDocsExamined,
  executionTimeMillis: explainApres.executionStats.executionTimeMillis
});

// ─── 4.4 : Index TTL pour archivage ───────────────────────────────────────────
// Archivage après 5 ans (5 * 365 * 24 * 3600 secondes)
const FIVE_YEARS_SECONDS = 157680000;

db.analyses.createIndex(
  { date: 1 },
  { expireAfterSeconds: FIVE_YEARS_SECONDS }
);

print("\nIndex TTL créé sur la collection 'analyses'.");