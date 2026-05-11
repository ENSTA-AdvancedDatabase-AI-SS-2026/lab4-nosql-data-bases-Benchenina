"""
TP5 - Benchmark Comparatif NoSQL
Mesurer les performances de Redis, MongoDB, Cassandra, Neo4j
"""
import time
import statistics
import json
import uuid
import threading
from concurrent.futures import ThreadPoolExecutor
from typing import Callable, List, Tuple
import redis
from pymongo import MongoClient
from cassandra.cluster import Cluster
from cassandra.query import BatchStatement, BatchType
from neo4j import GraphDatabase

# ─── Utilitaires de mesure ────────────────────────────────────────────────────

def measure_latency(fn: Callable, iterations: int = 1000) -> dict:
    """
    Exécuter fn iterations fois et retourner les statistiques
    """
    latencies = []
    for _ in range(iterations):
        start = time.perf_counter()
        fn()
        latencies.append((time.perf_counter() - start) * 1000)  # en ms
    
    latencies.sort()
    return {
        "mean_ms": statistics.mean(latencies),
        "p50_ms": latencies[int(0.50 * len(latencies) - 1)],
        "p95_ms": latencies[int(0.95 * len(latencies) - 1)],
        "p99_ms": latencies[int(0.99 * len(latencies) - 1)],
        "max_ms": max(latencies),
        "throughput_rps": 1000 / statistics.mean(latencies) if statistics.mean(latencies) > 0 else 0
    }

def print_results(name: str, results: dict):
    print(f"\n{'='*5} {name} {'='*5}")
    for k, v in results.items():
        if isinstance(v, float):
            print(f"{k:15}: {v:8.4f}")
        else:
            print(f"{k:15}: {v}")

# ─── Ex1 : Benchmark Écriture ─────────────────────────────────────────────────

def benchmark_write_redis(n: int):
    r = redis.Redis(host='localhost', port=6379, decode_responses=True)
    start = time.time()
    pipe = r.pipeline()
    for i in range(n):
        pipe.set(f"user:{i}", json.dumps({"id": i, "val": "data"}))
        if i % 1000 == 0:
            pipe.execute()
    pipe.execute()
    duration = time.time() - start
    print(f"Redis: {n} inserts in {duration:.2f}s ({n/duration:.0f} ops/s)")

def benchmark_write_mongodb(n: int):
    client = MongoClient('mongodb://admin:admin123@localhost:27017/')
    db = client['benchmark_db']
    coll = db['test_collection']
    coll.drop()
    
    data = [{"_id": i, "val": "data"} for i in range(n)]
    start = time.time()
    # Utilisation de insert_many pour le débit
    coll.insert_many(data, ordered=False)
    duration = time.time() - start
    print(f"MongoDB: {n} inserts in {duration:.2f}s ({n/duration:.0f} ops/s)")

def benchmark_write_cassandra(n: int):
    cluster = Cluster(['localhost'])
    session = cluster.connect()
    session.execute("CREATE KEYSPACE IF NOT EXISTS bench WITH replication = {'class':'SimpleStrategy', 'replication_factor':1}")
    session.execute("CREATE TABLE IF NOT EXISTS bench.test (id int PRIMARY KEY, val text)")
    
    prep = session.prepare("INSERT INTO bench.test (id, val) VALUES (?, ?)")
    start = time.time()
    
    for i in range(0, n, 50):
        batch = BatchStatement(batch_type=BatchType.UNLOGGED)
        for j in range(i, min(i + 50, n)):
            batch.add(prep, (j, "data"))
        session.execute(batch)
        
    duration = time.time() - start
    print(f"Cassandra: {n} inserts in {duration:.2f}s ({n/duration:.0f} ops/s)")

# ─── Ex2 : Benchmark Lecture ─────────────────────────────────────────────────

def benchmark_read_redis():
    r = redis.Redis(host='localhost', port=6379)
    
    print("\n--- Redis Read Latency ---")
    # Point Lookup
    res_get = measure_latency(lambda: r.get("user:5000"))
    print_results("GET (Point)", res_get)
    
    # Range (Simulé par MGET sur keys connues)
    keys = [f"user:{i}" for i in range(100, 200)]
    res_mget = measure_latency(lambda: r.mget(keys))
    print_results("MGET (Range)", res_mget)

def benchmark_read_mongodb():
    client = MongoClient('mongodb://admin:admin123@localhost:27017/')
    db = client['benchmark_db']
    coll = db['test_collection']
    
    print("\n--- MongoDB Read Latency ---")
    # Point Lookup
    res_find = measure_latency(lambda: coll.find_one({"_id": 5000}))
    print_results("find_one", res_find)
    
    # Range Query
    res_range = measure_latency(lambda: list(coll.find({"_id": {"$gt": 1000, "$lt": 1100}})))
    print_results("Range (100 docs)", res_range)

# ─── Ex3 : Charge concurrente ─────────────────────────────────────────────────

def benchmark_concurrent(db_fn: Callable, n_clients: int = 50, requests_per_client: int = 200):
    latencies = []
    
    def client_task():
        for _ in range(requests_per_client):
            start = time.perf_counter()
            db_fn()
            latencies.append((time.perf_counter() - start) * 1000)

    start_total = time.perf_counter()
    with ThreadPoolExecutor(max_workers=n_clients) as executor:
        for _ in range(n_clients):
            executor.submit(client_task)
    
    total_duration = time.perf_counter() - start_total
    total_reqs = n_clients * requests_per_client
    
    print(f"\nConcurrent Test ({n_clients} clients):")
    print(f"Total Requests : {total_reqs}")
    print(f"Total Time     : {total_duration:.2f}s")
    print(f"Avg Throughput : {total_reqs/total_duration:.2f} req/s")
    print(f"Avg Latency    : {statistics.mean(latencies):.4f} ms")

# ─── Main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("🚀 Benchmark NoSQL - Comparatif des technologies")
    print("="*60)
    
    # N total d'enregistrements pour l'écriture
    N = 10000 
    
    print(f"\n📝 [Ex1] Benchmark Écriture ({N:,} enregistrements)")
    benchmark_write_redis(N)
    benchmark_write_mongodb(N)
    benchmark_write_cassandra(N)
    
    print(f"\n🔍 [Ex2] Benchmark Lecture")
    benchmark_read_redis()
    benchmark_read_mongodb()
    
    print(f"\n💥 [Ex3] Test de Charge Concurrente (MongoDB)")
    # Exemple avec une lecture simple MongoDB
    client = MongoClient('mongodb://admin:admin123@localhost:27017/')
    coll = client['benchmark_db']['test_collection']
    benchmark_concurrent(lambda: coll.find_one({"_id": 100}), n_clients=20, requests_per_client=100)

    print("\n" + "="*60)
    print("✅ Benchmark terminé.")