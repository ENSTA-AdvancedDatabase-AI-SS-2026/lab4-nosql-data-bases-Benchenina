-- TP3 - Exercice 1 : Schéma Cassandra
-- Use Case : SmartGrid DZ - IoT Électrique

-- ─── 1.1 : Créer le Keyspace ──────────────────────────────────────────────────
-- replication_factor: 1 for local lab environment as per README
CREATE KEYSPACE IF NOT EXISTS smartgrid
WITH replication = {
  'class': 'SimpleStrategy', 
  'replication_factor': 1
};

USE smartgrid;

-- ─── 1.2 : Table mesures_par_capteur ──────────────────────────────────────────
-- Target Query: "Measures of sensor X between T1 and T2"
-- Strategy: We include 'date_jour' in the Partition Key to bucket data by day. 
-- This prevents a single sensor's 90-day history from creating a massive partition.
CREATE TABLE IF NOT EXISTS mesures_par_capteur (
  capteur_id   UUID,
  date_jour    DATE,        -- Bucket key (e.g., 2026-05-11)
  timestamp    TIMESTAMP,
  wilaya       TEXT,
  commune      TEXT,
  tension_v    FLOAT,
  courant_a    FLOAT,
  puissance_kw FLOAT,
  frequence_hz FLOAT,
  temperature  FLOAT,
  alerte       BOOLEAN,
  -- Primary Key: ((Partition), Clustering)
  PRIMARY KEY ((capteur_id, date_jour), timestamp)
) WITH CLUSTERING ORDER BY (timestamp DESC)
  AND default_time_to_live = 7776000;  -- 90 days


-- ─── 1.3 : Table alertes_par_wilaya ───────────────────────────────────────────
-- Target Query: "Alerts of wilaya X on day Y"
CREATE TABLE IF NOT EXISTS alertes_par_wilaya (
  wilaya       TEXT,
  date_jour    DATE,
  timestamp    TIMESTAMP,
  capteur_id   UUID,
  code_alerte  TEXT,
  description  TEXT,
  gravite      INT,   -- 1=info, 2=warning, 3=critique
  resolue      BOOLEAN,
  PRIMARY KEY ((wilaya, date_jour), timestamp)
) WITH CLUSTERING ORDER BY (timestamp DESC)
  AND default_time_to_live = 31536000;  -- 1 year


-- ─── 1.4 : Table agregats_horaires ────────────────────────────────────────────
-- Target Query: "Hourly average for dashboard"
CREATE TABLE IF NOT EXISTS agregats_horaires (
  wilaya            TEXT,
  date_heure        TIMESTAMP,
  nb_capteurs       INT,
  puissance_moy_kw  FLOAT,
  puissance_max_kw  FLOAT,
  puissance_min_kw  FLOAT,
  nb_alertes        INT,
  PRIMARY KEY ((wilaya), date_heure)
) WITH CLUSTERING ORDER BY (date_heure DESC)
  AND default_time_to_live = 157680000;  -- 5 years
