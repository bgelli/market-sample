# FastAPI Template

A simple FastAPI template with database integration using SQLAlchemy and SQLite.

## Features

- FastAPI web framework
- SQLAlchemy ORM with SQLite database, using async engine
- Pydantic models for data validation
- Product management endpoints (CRUD operations)
- Environment configuration with python-dotenv
- Development dependencies for testing and code formatting

## Installation

This project uses `uv` for dependency management. Make sure you have `uv` installed:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Install dependencies:

```bash
uv sync
```

## Running the Application

### Development Mode (with auto-reload)

```bash
uv run uvicorn main:app --reload
```

### Production Mode

```bash
uv run uvicorn main:app --host 0.0.0.0 --port 8000
```

The application will be available at `http://localhost:8000`

## API Endpoints

- `GET /products` - Get all products
- `GET /products/{product_id}` - Get a specific product by ID
- `POST /products` - Create a new product
- `PUT /products/{product_id}` - Update an existing product
- `DELETE /products/{product_id}` - Delete a product

## Example Usage

### Create a product

```bash
curl -X POST "http://localhost:8000/products" \
     -H "Content-Type: application/json" \
     -d '{"name": "Laptop", "price": 999.99, "description": "High-performance laptop", "stock": 10}'
```

### Get all products

```bash
curl -X GET "http://localhost:8000/products"
```

### Get a specific product

```bash
curl -X GET "http://localhost:8000/products/1"
```

### Update a product

```bash
curl -X PUT "http://localhost:8000/products/1" \
     -H "Content-Type: application/json" \
     -d '{"name": "Gaming Laptop", "price": 1299.99, "stock": 5}'
```

### Delete a product

```bash
curl -X DELETE "http://localhost:8000/products/1"
```

## Configuration

Create a `.env` file in the project root to customize settings:

```env
APP_NAME=My FastAPI App
DATABASE_URL=sqlite+aiosqlite:///./app.db
DEBUG=true
```

## Database

The application uses SQLite by default, using the aiosqlite engine. The database file (`app.db`) will be created automatically when you first run the application.

## Development

Run tests:

```bash
uv run pytest
```

Format code:

```bash
uv run black .
uv run isort .
```

Lint code:

```bash
uv run flake8 .
```
