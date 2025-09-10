from contextlib import asynccontextmanager
from typing import List

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import Product, create_tables, get_db


class ProductDTO(BaseModel):
    id: int
    name: str
    price: float
    description: str | None = None
    stock: int

    class Config:
        from_attributes = True


class ProductCreate(BaseModel):
    name: str
    price: float
    description: str | None = None
    stock: int


class ProductUpdate(BaseModel):
    name: str | None = None
    price: float | None = None
    description: str | None = None
    stock: int | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/products", response_model=List[ProductDTO])
async def get_products(db: AsyncSession = Depends(get_db)):
    """Get all products"""
    result = await db.execute(select(Product))
    products = result.scalars().all()
    return products


@app.get("/products/{product_id}", response_model=ProductDTO)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific product by ID"""
    result = await db.execute(select(Product).filter(Product.id == product_id))
    product = result.scalar_one_or_none()
    
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return product


@app.post("/products", response_model=ProductDTO, status_code=201)
async def create_product(product: ProductCreate, db: AsyncSession = Depends(get_db)):
    """Create a new product"""
    db_product = Product(
        name=product.name,
        price=product.price,
        description=product.description,
        stock=product.stock
    )
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product


@app.put("/products/{product_id}", response_model=ProductDTO)
async def update_product(
    product_id: int, 
    product_update: ProductUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """Update an existing product"""
    result = await db.execute(select(Product).filter(Product.id == product_id))
    db_product = result.scalar_one_or_none()
    
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Update only provided fields
    update_data = product_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_product, field, value)
    
    await db.commit()
    await db.refresh(db_product)
    return db_product


@app.delete("/products/{product_id}")
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a product"""
    result = await db.execute(select(Product).filter(Product.id == product_id))
    db_product = result.scalar_one_or_none()
    
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    await db.delete(db_product)
    await db.commit()
    return {"message": "Product deleted successfully"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
