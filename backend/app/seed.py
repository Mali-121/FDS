"""
Seed script to generate 100,000-150,000 product records.
Uses bulk_save_objects for optimal performance.
"""
from faker import Faker
from sqlalchemy.orm import Session
from app.db import SessionLocal, engine, Base
from app.models import Product
import random

fake = Faker()
Faker.seed(42)  # For reproducible data
random.seed(42)


def generate_products(count: int = 125000):
    """Generate product data using Faker."""
    categories = [
        "Electronics",
        "Clothing",
        "Home & Garden",
        "Sports",
        "Books",
        "Toys",
        "Food & Beverages",
        "Health & Beauty",
        "Automotive",
        "Office Supplies",
    ]

    products = []
    for _ in range(count):
        products.append(
            Product(
                name=fake.catch_phrase() + " " + fake.word().title(),
                category=random.choice(categories),
                price=round(random.uniform(5.99, 9999.99), 2),
                stock=random.randint(0, 10000),
                rating=round(random.uniform(0, 5), 2),
            )
        )

    return products


def seed_database(force: bool = False):
    """Seed the database with products.
    
    Args:
        force: If True, clear existing products and reseed.
    """
    import os
    
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        # Check if products already exist
        existing_count = db.query(Product).count()
        if existing_count > 0:
            if force or os.getenv("FORCE_SEED", "").lower() == "true":
                print(f"Database already contains {existing_count} products.")
                print("Clearing existing products...")
                db.query(Product).delete()
                db.commit()
            else:
                print(f"Database already contains {existing_count} products.")
                print("Skipping seed. Set FORCE_SEED=true to reseed.")
                return

        print("Generating product data...")
        products = generate_products(125000)

        print(f"Inserting {len(products)} products into database...")
        # Use bulk_save_objects for optimal performance
        batch_size = 10000
        for i in range(0, len(products), batch_size):
            batch = products[i : i + batch_size]
            db.bulk_save_objects(batch)
            db.commit()
            print(f"Inserted batch {i // batch_size + 1}/{(len(products) + batch_size - 1) // batch_size}")

        print(f"Successfully seeded {len(products)} products!")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import sys
    force = len(sys.argv) > 1 and sys.argv[1] == "--force"
    seed_database(force=force)

