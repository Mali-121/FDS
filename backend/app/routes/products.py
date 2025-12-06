from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, asc, desc
from typing import Optional
from app.db import get_db
from app.models import Product
from app.schemas import (
    Product as ProductSchema,
    ProductListResponse,
    SortField,
    SortOrder,
)
from app.cache import get_cached, set_cached, get_cache_key
import time

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=ProductListResponse)
async def get_products(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search in name and category"),
    category: Optional[str] = Query(None, description="Filter by category"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    min_rating: Optional[float] = Query(None, ge=0, le=5, description="Minimum rating"),
    sort_by: SortField = Query(SortField.created_at, description="Sort field"),
    sort_order: SortOrder = Query(SortOrder.desc, description="Sort order"),
    db: Session = Depends(get_db),
):
    """
    Get products with pagination, filtering, sorting, and search.
    Cached for 5 minutes.
    """
    start_time = time.time()

    # Generate cache key
    cache_key = get_cache_key(
        "products:list",
        page=page,
        page_size=page_size,
        search=search,
        category=category,
        min_price=min_price,
        max_price=max_price,
        min_rating=min_rating,
        sort_by=sort_by.value,
        sort_order=sort_order.value,
    )

    # Try to get from cache
    cached_result = get_cached(cache_key)
    if cached_result:
        try:
            # Validate cached items back to ProductSchema objects
            # Ensure items are dictionaries, not strings
            items = cached_result.get("items", [])
            if items and isinstance(items[0], str):
                # Old cache format detected - invalidate and query fresh
                from app.cache import invalidate_cache
                invalidate_cache("products:list:*")
                cached_result = None
            else:
                # Validate dict items to ProductSchema
                validated_items = [
                    ProductSchema.model_validate(item) for item in items
                ]
                cached_result["items"] = validated_items
                return ProductListResponse(**cached_result)
        except Exception as e:
            # If validation fails, clear cache and query fresh
            print(f"Cache validation error: {e}")
            from app.cache import invalidate_cache
            invalidate_cache("products:list:*")
            cached_result = None

    # Build query
    query = db.query(Product)

    # Apply search
    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            or_(
                func.lower(Product.name).like(search_term),
                func.lower(Product.category).like(search_term),
            )
        )

    # Apply filters
    if category:
        query = query.filter(Product.category == category)

    if min_price is not None:
        query = query.filter(Product.price >= min_price)

    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    if min_rating is not None:
        query = query.filter(Product.rating >= min_rating)

    # Get total count before pagination
    total = query.count()

    # Apply sorting
    sort_column = getattr(Product, sort_by.value)
    if sort_order == SortOrder.asc:
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    # Apply pagination
    offset = (page - 1) * page_size
    products = query.offset(offset).limit(page_size).all()

    # Calculate total pages
    total_pages = (total + page_size - 1) // page_size

    # Build response - convert to dicts for caching
    product_schemas = [ProductSchema.model_validate(p) for p in products]
    response_data = {
        "items": [p.model_dump() for p in product_schemas],  # Convert to dicts for caching
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }

    # Cache the result
    set_cached(cache_key, response_data, expire=300)

    # Performance check
    elapsed = (time.time() - start_time) * 1000
    if elapsed > 100:
        print(f"Warning: Query took {elapsed:.2f}ms (target: <100ms)")

    # Return with ProductSchema objects
    return ProductListResponse(
        items=product_schemas,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/categories")
async def get_categories(db: Session = Depends(get_db)):
    """Get all unique categories. Cached for 1 hour."""
    cache_key = get_cache_key("products:categories")

    # Try cache
    cached_result = get_cached(cache_key)
    if cached_result:
        return cached_result

    # Query database for unique categories
    categories = db.query(Product.category).distinct().order_by(Product.category).all()
    category_list = [cat[0] for cat in categories]

    # Cache for 1 hour (categories don't change often)
    set_cached(cache_key, category_list, expire=3600)

    return category_list


@router.get("/{product_id}", response_model=ProductSchema)
async def get_product(
    product_id: int,
    db: Session = Depends(get_db),
):
    """Get a single product by ID. Cached for 5 minutes."""
    cache_key = get_cache_key("products:detail", id=product_id)

    # Try cache
    cached_result = get_cached(cache_key)
    if cached_result:
        return ProductSchema.model_validate(cached_result)

    # Query database
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product_data = ProductSchema.model_validate(product)

    # Cache the result
    set_cached(cache_key, product_data.model_dump(), expire=300)

    return product_data


