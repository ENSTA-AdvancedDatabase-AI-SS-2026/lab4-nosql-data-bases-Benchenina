/**
 * TP2 - Exercice 1 : Modélisation MongoDB
 * Use Case : HealthCare DZ - Dossiers Médicaux
 */

// Se connecter à la base médicale
use("medical_db");

// ─── 1.1 : Créer la collection avec validation ────────────────────────────────
db.createCollection("patients", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["cin", "nom", "prenom", "dateNaissance", "sexe"],
      properties: {
        cin: { bsonType: "string", description: "CIN obligatoire" },
        nom: { bsonType: "string", description: "Nom du patient" },
        prenom: { bsonType: "string", description: "Prénom du patient" },
        dateNaissance: { bsonType: "date", description: "Date de naissance" },
        sexe: { bsonType: "string", enum: ["M", "F"], description: "Sexe du patient" },
        adresse: { bsonType: "object", properties: { wilaya: { bsonType: "string" }, commune: { bsonType: "string" } } },
        groupeSanguin: { bsonType: "string" },
        antecedents: { bsonType: "array", items: { bsonType: "string" } },
        allergies: { bsonType: "array", items: { bsonType: "string" } },
        consultations: { bsonType: "array", items: { bsonType: "object" } }
      }
    }
  }
});

// ─── 1.2 : Insérer des patients avec données algériennes ──────────────────────
const patients = [
  { cin: "198001012300", nom: "Bensalem", prenom: "Ahmed", dateNaissance: new Date("1980-01-01"), sexe: "M", adresse: { wilaya: "Alger", commune: "Bab Ezzouar" }, groupeSanguin: "O+", antecedents: ["Diabète type 2", "HTA"], allergies: ["Pénicilline"], consultations: [
    { id: new ObjectId(), date: new Date("2024-01-15"), medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" }, diagnostic: "Hypertension artérielle", tension: { systolique: 145, diastolique: 92 }, medicaments: [{ nom: "Amlodipine", dosage: "5mg", duree: "30 jours" }], notes: "Surveillance tensionnelle" },
    { id: new ObjectId(), date: new Date("2024-03-20"), medecin: { nom: "Dr. Hamza", specialite: "Endocrinologie" }, diagnostic: "Diabète type 2", glycemie: 1.8, medicaments: [{ nom: "Metformine", dosage: "500mg", duree: "60 jours" }], notes: "Contrôle glycémique" }
  ] },
  { cin: "198501020450", nom: "Belhadj", prenom: "Fatima", dateNaissance: new Date("1985-01-02"), sexe: "F", adresse: { wilaya: "Oran", commune: "Sidi El Houari" }, groupeSanguin: "A-", antecedents: ["Asthme"], allergies: [], consultations: [
    { id: new ObjectId(), date: new Date("2024-02-05"), medecin: { nom: "Dr. Laïd", specialite: "Pneumologie" }, diagnostic: "Asthme allergique", medicaments: [{ nom: "Salbutamol", dosage: "100mcg", duree: "30 jours" }], notes: "Inhalateur prescrit" },
    { id: new ObjectId(), date: new Date("2024-05-12"), medecin: { nom: "Dr. Laïd", specialite: "Pneumologie" }, diagnostic: "Asthme bien contrôlé", medicaments: [{ nom: "Salbutamol", dosage: "100mcg", duree: "30 jours" }], notes: "Bonne compliance" }
  ] },
  { cin: "199001011200", nom: "Zidane", prenom: "Ali", dateNaissance: new Date("1990-01-01"), sexe: "M", adresse: { wilaya: "Constantine", commune: "Sidi M'Cid" }, groupeSanguin: "B+", antecedents: ["HTA"], allergies: [], consultations: [
    { id: new ObjectId(), date: new Date("2024-01-22"), medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" }, diagnostic: "Hypertension artérielle", tension: { systolique: 150, diastolique: 95 }, medicaments: [{ nom: "Lisinopril", dosage: "10mg", duree: "30 jours" }], notes: "Première visite" },
    { id: new ObjectId(), date: new Date("2024-04-18"), medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" }, diagnostic: "HTA contrôlée", tension: { systolique: 135, diastolique: 85 }, medicaments: [{ nom: "Lisinopril", dosage: "10mg", duree: "30 jours" }], notes: "Bonne réponse" }
  ] },
  { cin: "197501013400", nom: "Boudjemaa", prenom: "Mehdi", dateNaissance: new Date("1975-01-01"), sexe: "M", adresse: { wilaya: "Annaba", commune: "Sidi Amar" }, groupeSanguin: "AB+", antecedents: ["Diabète type 2", "HTA", "Cholestérol"], allergies: ["Aspirine"], consultations: [
    { id: new ObjectId(), date: new Date("2024-01-10"), medecin: { nom: "Dr. Hamza", specialite: "Endocrinologie" }, diagnostic: "Diabète type 2 mal contrôlé", glycemie: 2.1, medicaments: [{ nom: "Metformine", dosage: "1000mg", duree: "60 jours" }], notes: "Augmentation posologie" },
    { id: new ObjectId(), date: new Date("2024-03-15"), medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" }, diagnostic: "Syndrome métabolique", tension: { systolique: 145, diastolique: 92 }, medicaments: [{ nom: "Atorvastatine", dosage: "40mg", duree: "30 jours" }], notes: "Recommandation régime" }
  ] },
  { cin: "198801012100", nom: "Kacimi", prenom: "Leila", dateNaissance: new Date("1988-01-01"), sexe: "F", adresse: { wilaya: "Blida", commune: "Ouled Yaïch" }, groupeSanguin: "O+", antecedents: ["HTA"], allergies: ["AINS"], consultations: [
    { id: new ObjectId(), date: new Date("2024-02-14"), medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" }, diagnostic: "Hypertension artérielle", tension: { systolique: 142, diastolique: 90 }, medicaments: [{ nom: "Amlodipine", dosage: "5mg", duree: "30 jours" }], notes: "Première découverte" },
    { id: new ObjectId(), date: new Date("2024-05-03"), medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" }, diagnostic: "HTA en cours de traitement", tension: { systolique: 138, diastolique: 86 }, medicaments: [{ nom: "Amlodipine", dosage: "5mg", duree: "30 jours" }], notes: "Suivi satisfaisant" }
  ] },
  { cin: "199201014500", nom: "Rahmani", prenom: "Samir", dateNaissance: new Date("1992-01-01"), sexe: "M", adresse: { wilaya: "Alger", commune: "Bab El Oued" }, groupeSanguin: "B-", antecedents: ["Diabète type 2"], allergies: [], consultations: [
    { id: new ObjectId(), date: new Date("2024-01-28"), medecin: { nom: "Dr. Hamza", specialite: "Endocrinologie" }, diagnostic: "Diabète type 2 nouvellement diagnostiqué", glycemie: 2.3, medicaments: [{ nom: "Metformine", dosage: "500mg", duree: "60 jours" }], notes: "Education diabétique" },
    { id: new ObjectId(), date: new Date("2024-04-10"), medecin: { nom: "Dr. Hamza", specialite: "Endocrinologie" }, diagnostic: "Diabète type 2", glycemie: 1.9, medicaments: [{ nom: "Metformine", dosage: "1000mg", duree: "60 jours" }], notes: "Dosage augmenté" }
  ] },
  { cin: "198301015600", nom: "Sebti", prenom: "Nadia", dateNaissance: new Date("1983-01-01"), sexe: "F", adresse: { wilaya: "Oran", commune: "Es-Senia" }, groupeSanguin: "A+", antecedents: ["Asthme", "Rhinite allergique"], allergies: ["Pénicilline G"], consultations: [
    { id: new ObjectId(), date: new Date("2024-03-05"), medecin: { nom: "Dr. Laïd", specialite: "Pneumologie" }, diagnostic: "Asthme allergique exacerbé", medicaments: [{ nom: "Salbutamol", dosage: "100mcg", duree: "30 jours" }], notes: "Aggravation printanière" },
    { id: new ObjectId(), date: new Date("2024-06-12"), medecin: { nom: "Dr. Laïd", specialite: "Pneumologie" }, diagnostic: "Asthme contrôlé", medicaments: [{ nom: "Salbutamol", dosage: "100mcg", duree: "30 jours" }], notes: "Bonne compliance" }
  ] },
  { cin: "197701016700", nom: "Cherif", prenom: "Hassan", dateNaissance: new Date("1977-01-01"), sexe: "M", adresse: { wilaya: "Constantine", commune: "Zighoud Youcef" }, groupeSanguin: "O-", antecedents: ["HTA", "Diabète type 2"], allergies: [], consultations: [
    { id: new ObjectId(), date: new Date("2024-02-20"), medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" }, diagnostic: "Hypertension artérielle", tension: { systolique: 148, diastolique: 93 }, medicaments: [{ nom: "Enalapril", dosage: "10mg", duree: "30 jours" }], notes: "HTA de stade 2" },
    { id: new ObjectId(), date: new Date("2024-05-08"), medecin: { nom: "Dr. Hamza", specialite: "Endocrinologie" }, diagnostic: "Diabète type 2", glycemie: 1.85, medicaments: [{ nom: "Metformine", dosage: "1000mg", duree: "60 jours" }], notes: "Syndrome métabolique" }
  ] },
  { cin: "199501017800", nom: "Azzab", prenom: "Yasmin", dateNaissance: new Date("1995-01-01"), sexe: "F", adresse: { wilaya: "Annaba", commune: "Menerville" }, groupeSanguin: "AB-", antecedents: [], allergies: ["Céphalosprines"], consultations: [
    { id: new ObjectId(), date: new Date("2024-04-01"), medecin: { nom: "Dr. Laïd", specialite: "Pneumologie" }, diagnostic: "Rhinite allergique", medicaments: [{ nom: "Cétirizine", dosage: "10mg", duree: "30 jours" }], notes: "Antihistaminique" },
    { id: new ObjectId(), date: new Date("2024-06-18"), medecin: { nom: "Dr. Laïd", specialite: "Pneumologie" }, diagnostic: "Rhinite allergique stable", medicaments: [{ nom: "Cétirizine", dosage: "10mg", duree: "30 jours" }], notes: "Bonne réponse" }
  ] },
  { cin: "198601018900", nom: "Djaout", prenom: "Khalid", dateNaissance: new Date("1986-01-01"), sexe: "M", adresse: { wilaya: "Blida", commune: "Chiffa" }, groupeSanguin: "B+", antecedents: ["Cholestérol"], allergies: [], consultations: [
    { id: new ObjectId(), date: new Date("2024-03-10"), medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" }, diagnostic: "Dyslipidémie", cholesterol: 2.3, medicaments: [{ nom: "Simvastatine", dosage: "20mg", duree: "30 jours" }], notes: "Régime recommandé" },
    { id: new ObjectId(), date: new Date("2024-06-05"), medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" }, diagnostic: "Dyslipidémie améliorée", cholesterol: 2.0, medicaments: [{ nom: "Simvastatine", dosage: "20mg", duree: "30 jours" }], notes: "Amélioration" }
  ] },
  { cin: "197401019000", nom: "Medel", prenom: "Souad", dateNaissance: new Date("1974-01-01"), sexe: "F", adresse: { wilaya: "Alger", commune: "Sidi Mhamed" }, groupeSanguin: "O+", antecedents: ["Diabète type 2", "HTA", "Cholestérol"], allergies: ["Sulfonamides"], consultations: [
    { id: new ObjectId(), date: new Date("2024-01-05"), medecin: { nom: "Dr. Hamza", specialite: "Endocrinologie" }, diagnostic: "Syndrome métabolique", glycemie: 2.1, medicaments: [{ nom: "Metformine", dosage: "1000mg", duree: "60 jours" }], notes: "Risque cardiovasculaire" },
    { id: new ObjectId(), date: new Date("2024-03-20"), medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" }, diagnostic: "Hypertension artérielle", tension: { systolique: 142, diastolique: 90 }, medicaments: [{ nom: "Amlodipine", dosage: "5mg", duree: "30 jours" }], notes: "Traitement multiviscéral" }
  ] },
  { cin: "199101010100", nom: "Moussaoui", prenom: "Rida", dateNaissance: new Date("1991-01-01"), sexe: "M", adresse: { wilaya: "Oran", commune: "Bir El Djir" }, groupeSanguin: "A-", antecedents: ["Asthme"], allergies: [], consultations: [
    { id: new ObjectId(), date: new Date("2024-02-28"), medecin: { nom: "Dr. Laïd", specialite: "Pneumologie" }, diagnostic: "Asthme mal contrôlé", medicaments: [{ nom: "Salbutamol", dosage: "100mcg", duree: "30 jours" }], notes: "Augmentation posologie" },
    { id: new ObjectId(), date: new Date("2024-05-14"), medecin: { nom: "Dr. Laïd", specialite: "Pneumologie" }, diagnostic: "Asthme bien contrôlé", medicaments: [{ nom: "Salbutamol", dosage: "100mcg", duree: "30 jours" }], notes: "Bonne réponse" }
  ] },
  { cin: "198401010200", nom: "Hamdi", prenom: "Karim", dateNaissance: new Date("1984-01-01"), sexe: "M", adresse: { wilaya: "Constantine", commune: "Cité Béni Hamdane" }, groupeSanguin: "AB+", antecedents: ["HTA"], allergies: ["Béta-bloquants"], consultations: [
    { id: new ObjectId(), date: new Date("2024-01-17"), medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" }, diagnostic: "Hypertension artérielle", tension: { systolique: 150, diastolique: 96 }, medicaments: [{ nom: "Diltiazem", dosage: "120mg", duree: "30 jours" }], notes: "Intolérance béta-bloquants" },
    { id: new ObjectId(), date: new Date("2024-04-25"), medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" }, diagnostic: "HTA en cours de traitement", tension: { systolique: 140, diastolique: 89 }, medicaments: [{ nom: "Diltiazem", dosage: "120mg", duree: "30 jours" }], notes: "Bonne tolérance" }
  ] },
  { cin: "197101010300", nom: "Seghir", prenom: "Amira", dateNaissance: new Date("1971-01-01"), sexe: "F", adresse: { wilaya: "Annaba", commune: "Annaba" }, groupeSanguin: "O+", antecedents: ["HTA", "Diabète type 2", "Hyperthyroïdie"], allergies: [], consultations: [
    { id: new ObjectId(), date: new Date("2024-01-12"), medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" }, diagnostic: "Hypertension artérielle", tension: { systolique: 148, diastolique: 94 }, medicaments: [{ nom: "Amlodipine", dosage: "5mg", duree: "30 jours" }], notes: "Première visite" },
    { id: new ObjectId(), date: new Date("2024-03-28"), medecin: { nom: "Dr. Hamza", specialite: "Endocrinologie" }, diagnostic: "Diabète type 2 + Dysthyroïdie", glycemie: 1.8, medicaments: [{ nom: "Metformine", dosage: "500mg", duree: "60 jours" }], notes: "Comorbidités multiples" }
  ] },
  { cin: "199301010400", nom: "Saidane", prenom: "Zahra", dateNaissance: new Date("1993-01-01"), sexe: "F", adresse: { wilaya: "Blida", commune: "Boufaïk" }, groupeSanguin: "B+", antecedents: [], allergies: ["AINS"], consultations: [
    { id: new ObjectId(), date: new Date("2024-05-15"), medecin: { nom: "Dr. Laïd", specialite: "Pneumologie" }, diagnostic: "Rhinite allergique saisonnière", medicaments: [{ nom: "Loratadine", dosage: "10mg", duree: "30 jours" }], notes: "Allergie printanière" },
    { id: new ObjectId(), date: new Date("2024-08-01"), medecin: { nom: "Dr. Laïd", specialite: "Pneumologie" }, diagnostic: "Rhinite allergique stable", medicaments: [{ nom: "Loratadine", dosage: "10mg", duree: "30 jours" }], notes: "Suivi" }
  ] }
];

db.patients.insertMany(patients);

// ─── 1.3 : Collection analyses (référencée) ───────────────────────────────────
const patientIds = db.patients.find().toArray().map(p => p._id);

const analyses = [
  { patient_id: patientIds[0], date: new Date("2024-01-16"), type: "Glycémie", resultats: { valeur: 1.8, unite: "g/L", normal: true }, laboratoire: "Labo Central Alger", valide: true },
  { patient_id: patientIds[0], date: new Date("2024-01-16"), type: "Créatinine", resultats: { valeur: 0.8, unite: "mg/dL", normal: true }, laboratoire: "Labo Central Alger", valide: true },
  { patient_id: patientIds[1], date: new Date("2024-02-06"), type: "NFS", resultats: { gb: 7500, globules_rouges: 4.5, hemoglobine: 13.5 }, laboratoire: "Labo Oran", valide: true },
  { patient_id: patientIds[2], date: new Date("2024-01-23"), type: "ECG", resultats: { interpretation: "Rythme sinusal régulier", fr: 72 }, laboratoire: "Cardiologie Constantine", valide: true },
  { patient_id: patientIds[3], date: new Date("2024-01-11"), type: "Glycémie", resultats: { valeur: 2.1, unite: "g/L", normal: false }, laboratoire: "Labo Annaba", valide: true },
  { patient_id: patientIds[3], date: new Date("2024-01-11"), type: "Lipidogramme", resultats: { cholesterol: 2.3, triglycérides: 1.8, ldl: 1.5, hdl: 0.4 }, laboratoire: "Labo Annaba", valide: true },
  { patient_id: patientIds[4], date: new Date("2024-02-15"), type: "ECG", resultats: { interpretation: "Rythme sinusal régulier", fr: 68 }, laboratoire: "Cardiologie Alger", valide: true },
  { patient_id: patientIds[5], date: new Date("2024-01-29"), type: "Glycémie", resultats: { valeur: 2.3, unite: "g/L", normal: false }, laboratoire: "Labo Alger", valide: true },
  { patient_id: patientIds[6], date: new Date("2024-03-06"), type: "NFS", resultats: { gb: 8000, globules_rouges: 4.8, hemoglobine: 14.2 }, laboratoire: "Labo Oran", valide: true },
  { patient_id: patientIds[7], date: new Date("2024-02-21"), type: "ECG", resultats: { interpretation: "Rythme sinusal régulier, hypertrophie VG", fr: 75 }, laboratoire: "Cardiologie Constantine", valide: true },
  { patient_id: patientIds[7], date: new Date("2024-02-21"), type: "Glycémie", resultats: { valeur: 1.85, unite: "g/L", normal: true }, laboratoire: "Labo Constantine", valide: true },
  { patient_id: patientIds[8], date: new Date("2024-04-02"), type: "Glycémie", resultats: { valeur: 1.2, unite: "g/L", normal: true }, laboratoire: "Labo Annaba", valide: true },
  { patient_id: patientIds[9], date: new Date("2024-03-11"), type: "Lipidogramme", resultats: { cholesterol: 2.3, triglycérides: 1.5, ldl: 1.6, hdl: 0.42 }, laboratoire: "Labo Blida", valide: true },
  { patient_id: patientIds[10], date: new Date("2024-01-18"), type: "ECG", resultats: { interpretation: "Rythme sinusal régulier", fr: 70 }, laboratoire: "Cardiologie Alger", valide: true },
  { patient_id: patientIds[11], date: new Date("2024-02-01"), type: "Glycémie", resultats: { valeur: 1.9, unite: "g/L", normal: true }, laboratoire: "Labo Oran", valide: true }
];

db.analyses.insertMany(analyses);

print("✅ Modélisation terminée. Patients insérés:", db.patients.countDocuments());
print("✅ Analyses insérées:", db.analyses.countDocuments());
