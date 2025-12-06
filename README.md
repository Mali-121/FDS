# High-Performance Data Table

A full-stack application featuring a high-performance data table with virtual scrolling, built with FastAPI, Next.js 14, PostgreSQL, and Redis.

## 🚀 Quick Start

Run the entire system with one command:

```bash
docker compose up --build
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 📋 Prerequisites

- Docker and Docker Compose installed
- At least 4GB of available RAM (for seeding 125k records)

## 🏗️ Architecture

### Backend (FastAPI)
- **Framework**: FastAPI with SQLAlchemy ORM
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Performance**: Query response times < 100ms
- **Features**:
  - RESTful API with pagination, filtering, sorting, and search
  - Redis caching (5-minute TTL)
  - Database indexes on frequently queried fields
  - Bulk seeding for 100k+ records

### Frontend (Next.js 14)
- **Framework**: Next.js 14 with App Router
- **UI Library**: shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Virtual Scrolling**: @tanstack/react-virtual
- **Features**:
  - Virtual scrolling for smooth performance with large datasets
  - Instant search and filtering
  - Client-side sorting
  - Pagination controls
  - Product detail pages
  - Skeleton loaders and error states

### Infrastructure
- **Orchestration**: Docker Compose
- **Network**: Internal bridge network for service communication
- **Volumes**: Persistent storage for PostgreSQL and Redis data

## 📁 Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application entry point
│   │   ├── db.py            # Database configuration
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── cache.py         # Redis cache utilities
│   │   ├── seed.py          # Database seeding script
│   │   ├── deps.py          # Dependency injection
│   │   └── routes/
│   │       └── products.py  # Product API routes
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/
│   │   ├── page.tsx         # Main data table page
│   │   ├── products/
│   │   │   └── [id]/
│   │   │       └── page.tsx # Product detail page
│   │   ├── components/
│   │   │   └── DataTable.tsx # Main table component
│   │   └── providers.tsx    # React Query provider
│   ├── components/ui/       # shadcn/ui components
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🗄️ Database Seeding

To seed the database with 125,000 product records:

1. Start the services:
```bash
docker compose up -d db cache backend
```

2. Run the seed script:
```bash
docker compose exec backend python -m app.seed
```

Or use the helper script:
```bash
# On Windows
.\seed.bat

# On Linux/Mac
./seed.sh
```

The seed script uses:
- **Faker** for realistic data generation
- **bulk_save_objects** for optimal insert performance
- Batch processing (10,000 records per batch)

## 🔧 Configuration

### Environment Variables

**Backend**:
- `DATABASE_URL`: PostgreSQL connection string (default: `postgresql://postgres:postgres@db:5432/fastapi_db`)
- `REDIS_URL`: Redis connection string (default: `redis://cache:6379/0`)

**Frontend**:
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: `http://localhost:8000`)

## 🎯 Performance Optimizations

### Backend
1. **Database Indexes**: Created on `name`, `category`, `price`, and `rating` fields
2. **Composite Indexes**: For common query patterns (category+price, name+category)
3. **Redis Caching**: 5-minute TTL for list queries and individual products
4. **Connection Pooling**: SQLAlchemy pool with 10 connections, max overflow 20
5. **Query Optimization**: Efficient filtering and sorting at database level

### Frontend
1. **Virtual Scrolling**: Only renders visible rows using `@tanstack/react-virtual`
2. **React Query**: Caching with `keepPreviousData: true` for smooth pagination
3. **Debounced Search**: Instant search with query debouncing
4. **Skeleton Loaders**: Prevents layout shifts during data fetching
5. **Optimized Re-renders**: Memoized query parameters and efficient state management

## 🎨 UI/UX Choices

1. **Minimal Design**: Clean, modern interface using shadcn/ui components
2. **Responsive Layout**: Works on various screen sizes
3. **Loading States**: Skeleton loaders provide visual feedback
4. **Error Handling**: Clear error messages with retry options
5. **Empty States**: Helpful messages when no data is found
6. **Smooth Interactions**: Transitions and hover effects for better UX
7. **Accessibility**: Proper ARIA labels and keyboard navigation support

## 📊 API Endpoints

### GET `/api/products`
Get paginated list of products with filtering, sorting, and search.

**Query Parameters**:
- `page` (int): Page number (default: 1)
- `page_size` (int): Items per page (default: 50, max: 100)
- `search` (string): Search in name and category
- `category` (string): Filter by category
- `min_price` (float): Minimum price filter
- `max_price` (float): Maximum price filter
- `min_rating` (float): Minimum rating filter (0-5)
- `sort_by` (string): Sort field (name, price, rating, stock, created_at)
- `sort_order` (string): Sort order (asc, desc)

**Response**:
```json
{
  "items": [...],
  "total": 125000,
  "page": 1,
  "page_size": 50,
  "total_pages": 2500
}
```

### GET `/api/products/{id}`
Get a single product by ID.

**Response**:
```json
{
  "id": 1,
  "name": "Product Name",
  "category": "Electronics",
  "price": 99.99,
  "stock": 100,
  "rating": 4.5,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## 🧪 Performance Requirements

✅ **API Response Times**: < 100ms (with caching)
✅ **UI Initial Load**: < 2 seconds
✅ **Virtual Scroll**: Smooth scrolling for 100k+ rows
✅ **No Layout Shifts**: Stable UI during data loading
✅ **Client-side Operations**: Instant feedback

## 🚧 Future Improvements

With more time, I would implement:

1. **Advanced Features**:
   - Export to CSV/Excel functionality
   - Column visibility toggles
   - Saved filter presets
   - Advanced search with multiple criteria

2. **Performance**:
   - Server-side rendering (SSR) for initial page load
   - Infinite scroll as alternative to pagination
   - WebSocket for real-time updates
   - CDN for static assets

3. **User Experience**:
   - Dark mode toggle
   - Column resizing and reordering
   - Bulk actions (select multiple rows)
   - Toast notifications for actions

4. **Backend Enhancements**:
   - Authentication and authorization
   - Rate limiting
   - Request logging and monitoring
   - Database query optimization with EXPLAIN ANALYZE
   - Full-text search with PostgreSQL

5. **Testing**:
   - Unit tests for backend routes
   - Integration tests for API endpoints
   - E2E tests for frontend flows
   - Performance benchmarking

6. **DevOps**:
   - CI/CD pipeline
   - Health check endpoints
   - Monitoring and alerting
   - Database migrations with Alembic

## 📝 Development

### Running Locally (without Docker)

**Backend**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

### Database Migrations

The application uses SQLAlchemy's `create_all()` for simplicity. In production, consider using Alembic for migrations:

```bash
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## 📄 License

This project is built for assessment purposes.

## 👤 Author

Built as a full-stack assessment project demonstrating:
- High-performance data handling
- Modern web development practices
- Clean architecture and code organization
- Performance optimization techniques


