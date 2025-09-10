from contextlib import asynccontextmanager
from typing import List

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import Product, CartItem, create_tables, get_db


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


class CartItemDTO(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: ProductDTO

    class Config:
        from_attributes = True


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1


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


# Cart endpoints
@app.get("/cart", response_model=List[CartItemDTO])
async def get_cart(db: AsyncSession = Depends(get_db)):
    """Get all items in cart"""
    result = await db.execute(
        select(CartItem).join(Product).order_by(CartItem.created_at.desc())
    )
    cart_items = result.scalars().all()
    
    # Load the product relationship manually if needed
    for item in cart_items:
        if not item.product:
            product_result = await db.execute(select(Product).filter(Product.id == item.product_id))
            item.product = product_result.scalar_one()
    
    return cart_items


@app.post("/cart", response_model=CartItemDTO, status_code=201)
async def add_to_cart(cart_item: CartItemCreate, db: AsyncSession = Depends(get_db)):
    """Add a product to cart"""
    # Check if product exists and has sufficient stock
    product_result = await db.execute(select(Product).filter(Product.id == cart_item.product_id))
    product = product_result.scalar_one_or_none()
    
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product.stock < cart_item.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    # Check if item already exists in cart
    existing_item_result = await db.execute(
        select(CartItem).filter(CartItem.product_id == cart_item.product_id)
    )
    existing_item = existing_item_result.scalar_one_or_none()
    
    if existing_item:
        # Update quantity
        total_quantity = existing_item.quantity + cart_item.quantity
        if product.stock < total_quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        
        existing_item.quantity = total_quantity
        await db.commit()
        await db.refresh(existing_item)
        
        # Load product relationship
        product_result = await db.execute(select(Product).filter(Product.id == existing_item.product_id))
        existing_item.product = product_result.scalar_one()
        
        return existing_item
    else:
        # Create new cart item
        db_cart_item = CartItem(
            product_id=cart_item.product_id,
            quantity=cart_item.quantity
        )
        db.add(db_cart_item)
        await db.commit()
        await db.refresh(db_cart_item)
        
        # Load product relationship
        db_cart_item.product = product
        
        return db_cart_item


@app.delete("/cart/{cart_item_id}")
async def remove_from_cart(cart_item_id: int, db: AsyncSession = Depends(get_db)):
    """Remove item from cart"""
    result = await db.execute(select(CartItem).filter(CartItem.id == cart_item_id))
    cart_item = result.scalar_one_or_none()
    
    if cart_item is None:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    await db.delete(cart_item)
    await db.commit()
    return {"message": "Item removed from cart"}


@app.delete("/cart")
async def clear_cart(db: AsyncSession = Depends(get_db)):
    """Clear all items from cart"""
    result = await db.execute(select(CartItem))
    cart_items = result.scalars().all()
    
    for item in cart_items:
        await db.delete(item)
    
    await db.commit()
    return {"message": "Cart cleared"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
