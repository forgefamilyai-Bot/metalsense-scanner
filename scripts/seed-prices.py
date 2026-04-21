#!/usr/bin/env python3
"""
Seed initial metal prices and market data into the MetalSense database.
Run this after database migrations are complete.
"""

import os
import sys
import json
from datetime import datetime
from decimal import Decimal

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Real-world scrap metal prices (as of April 2026, from public sources)
METAL_DATA = [
    {
        "name": "Copper",
        "category": "Non-Ferrous",
        "description": "High-value non-ferrous metal, widely recycled from wiring and electronics",
        "priceUsd": 3.45,
        "unit": "per lb",
    },
    {
        "name": "Aluminum",
        "category": "Non-Ferrous",
        "description": "Lightweight non-ferrous metal, common in beverage cans and automotive parts",
        "priceUsd": 0.85,
        "unit": "per lb",
    },
    {
        "name": "Steel",
        "category": "Ferrous",
        "description": "Iron-based alloy, the most common recycled metal by volume",
        "priceUsd": 0.12,
        "unit": "per lb",
    },
    {
        "name": "Brass",
        "category": "Non-Ferrous",
        "description": "Copper-zinc alloy, valuable for plumbing fixtures and decorative items",
        "priceUsd": 1.95,
        "unit": "per lb",
    },
    {
        "name": "Stainless Steel",
        "category": "Ferrous",
        "description": "Corrosion-resistant steel alloy, used in appliances and industrial equipment",
        "priceUsd": 0.35,
        "unit": "per lb",
    },
    {
        "name": "Lead",
        "category": "Non-Ferrous",
        "description": "Dense metal used in batteries and radiation shielding",
        "priceUsd": 0.42,
        "unit": "per lb",
    },
    {
        "name": "Zinc",
        "category": "Non-Ferrous",
        "description": "Corrosion-resistant metal used in galvanizing and alloys",
        "priceUsd": 0.58,
        "unit": "per lb",
    },
    {
        "name": "Nickel",
        "category": "Non-Ferrous",
        "description": "Hard metal used in stainless steel and batteries",
        "priceUsd": 6.25,
        "unit": "per lb",
    },
]

def seed_database():
    """Seed the database with initial metal and price data."""
    import mysql.connector
    from mysql.connector import Error
    
    # Get database connection from environment
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("ERROR: DATABASE_URL environment variable not set")
        sys.exit(1)
    
    # Parse connection string: mysql://user:password@host:port/database
    try:
        # Simple parser for mysql:// URLs
        url_parts = db_url.replace("mysql://", "").split("@")
        user_pass = url_parts[0].split(":")
        host_db = url_parts[1].split("/")
        
        user = user_pass[0]
        password = user_pass[1] if len(user_pass) > 1 else ""
        host = host_db[0].split(":")[0]
        port = int(host_db[0].split(":")[1]) if ":" in host_db[0] else 3306
        database = host_db[1]
        
        print(f"Connecting to {host}:{port}/{database}...")
        
        connection = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            port=port,
            database=database
        )
        
        cursor = connection.cursor()
        
        # Insert metals
        print("Seeding metals...")
        for metal in METAL_DATA:
            cursor.execute(
                """
                INSERT INTO metals (name, category, description, unit)
                VALUES (%s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                description = VALUES(description)
                """,
                (metal["name"], metal["category"], metal["description"], metal["unit"])
            )
        
        connection.commit()
        
        # Get metal IDs and insert market prices
        print("Seeding market prices...")
        cursor.execute("SELECT id, name FROM metals")
        metals = {row[1]: row[0] for row in cursor.fetchall()}
        
        for metal in METAL_DATA:
            metal_id = metals.get(metal["name"])
            if metal_id:
                cursor.execute(
                    """
                    INSERT INTO marketPrices (metalId, priceUsd, recordedAt)
                    VALUES (%s, %s, NOW())
                    """,
                    (metal_id, Decimal(str(metal["priceUsd"])))
                )
        
        connection.commit()
        
        print("✓ Database seeding complete!")
        print(f"✓ Inserted {len(METAL_DATA)} metals with current market prices")
        
        cursor.close()
        connection.close()
        
    except Error as e:
        print(f"ERROR: Database connection failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    seed_database()
