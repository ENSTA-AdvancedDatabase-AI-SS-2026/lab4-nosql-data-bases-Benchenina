"""
TP3 - Exercice 2 : Ingestion de données IoT
Use Case : SmartGrid DZ - 10 000 capteurs, 5 minutes de mesures
"""
from cassandra.cluster import Cluster
from cassandra.query import BatchStatement, BatchType
import uuid
import random
from datetime import datetime, timedelta
import time

# Configuration
CASSANDRA_HOST = 'localhost'
KEYSPACE = 'smartgrid'
NB_CAPTEURS = 10000
MINUTES_HISTORIQUE = 5

WILAYAS = ["Alger", "Oran", "Constantine", "Annaba", "Blida"]
COMMUNES = {
    "Alger": ["Bab Ezzouar", "Hydra", "El Harrach", "Dar El Beida"],
    "Oran": ["Bir El Djir", "Es Senia", "Arzew"],
    "Constantine": ["El Khroub", "Ain Smara", "Hamma Bouziane"],
    "Annaba": ["El Bouni", "El Hadjar", "Seraidi"],
    "Blida": ["Bougara", "Boufarik", "Larbaa"],
}

def connect():
    cluster = Cluster([CASSANDRA_HOST])
    session = cluster.connect(KEYSPACE)
    return session, cluster

def generate_mesure(capteur_id, wilaya, commune, timestamp):
    tension_base = 220 
    return {
        "capteur_id": capteur_id,
        "date_jour": timestamp.date(),
        "timestamp": timestamp,
        "wilaya": wilaya,
        "commune": commune,
        "tension_v": round(tension_base + random.gauss(0, 5), 2),
        "courant_a": round(random.uniform(0.5, 15.0), 2),
        "puissance_kw": round(random.uniform(0.1, 3.3), 3),
        "frequence_hz": round(50 + random.gauss(0, 0.1), 2),
        "temperature": round(random.uniform(20, 65), 1),
        "alerte": random.random() < 0.05,
    }

def insert_single(session, stmt, mesure):
    """Inserts a single measurement using a prepared statement"""
    session.execute(stmt, (
        mesure["capteur_id"], mesure["date_jour"], mesure["timestamp"],
        mesure["wilaya"], mesure["commune"], mesure["tension_v"],
        mesure["courant_a"], mesure["puissance_kw"], mesure["frequence_hz"],
        mesure["temperature"], mesure["alerte"]
    ))

def insert_batch(session, stmt, mesures_list):
    """Inserts a batch of measurements efficiently using UNLOGGED BATCH"""
    batch = BatchStatement(batch_type=BatchType.UNLOGGED)
    for m in mesures_list:
        batch.add(stmt, (
            m["capteur_id"], m["date_jour"], m["timestamp"],
            m["wilaya"], m["commune"], m["tension_v"],
            m["courant_a"], m["puissance_kw"], m["frequence_hz"],
            m["temperature"], m["alerte"]
        ))
    session.execute(batch)

def run_ingestion(session):
    print(f"Démarrage ingestion : {NB_CAPTEURS} capteurs × {MINUTES_HISTORIQUE} min")
    
    # Pre-prepare statements for performance
    query_mesure = """
        INSERT INTO mesures_par_capteur 
        (capteur_id, date_jour, timestamp, wilaya, commune, tension_v, courant_a, puissance_kw, frequence_hz, temperature, alerte)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    prep_mesure = session.prepare(query_mesure)
    
    query_alerte = """
        INSERT INTO alertes_par_wilaya (wilaya, date_jour, timestamp, capteur_id, code_alerte, gravite, resolue)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """
    prep_alerte = session.prepare(query_alerte)

    # 1. Generate Sensor Registry
    sensors = []
    for _ in range(NB_CAPTEURS):
        w = random.choice(WILAYAS)
        sensors.append({
            "id": uuid.uuid4(),
            "wilaya": w,
            "commune": random.choice(COMMUNES[w])
        })

    start_time = time.time()
    total_inserted = 0
    
    # 2. Ingest 5 minutes of historical data
    now = datetime.now()
    for i in range(MINUTES_HISTORIQUE):
        ts = now - timedelta(minutes=i)
        current_batch = []
        
        for s in sensors:
            mesure = generate_mesure(s["id"], s["wilaya"], s["commune"], ts)
            current_batch.append(mesure)
            
            # If it's an alert, insert immediately or in a separate batch
            if mesure["alerte"]:
                session.execute(prep_alerte, (
                    s["wilaya"], ts.date(), ts, s["id"], "VOLTAGE_UNSTABLE", 2, False
                ))

            # Batch processing (threshold of 50 as per best practice)
            if len(current_batch) >= 50:
                insert_batch(session, prep_mesure, current_batch)
                total_inserted += len(current_batch)
                current_batch = []
        
        # Insert remaining items in the last batch of the minute
        if current_batch:
            insert_batch(session, prep_mesure, current_batch)
            total_inserted += len(current_batch)

    elapsed = time.time() - start_time
    print(f"\n✅ {total_inserted:,} mesures insérées en {elapsed:.1f}s")
    print(f"   Débit : {total_inserted/elapsed:,.0f} mesures/seconde")

if __name__ == "__main__":
    session, cluster = connect()
    run_ingestion(session)
    cluster.shutdown()