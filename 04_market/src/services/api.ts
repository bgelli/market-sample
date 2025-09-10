import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  stock: number;
}

export interface ProductCreate {
  name: string;
  price: number;
  description?: string;
  stock: number;
}

export interface ProductUpdate {
  name?: string;
  price?: number;
  description?: string;
  stock?: number;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: Product;
}

export interface CartItemCreate {
  product_id: number;
  quantity?: number;
}

export const productApi = {
  // Get all products
  getProducts: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data;
  },

  // Get product by ID
  getProduct: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create new product
  createProduct: async (product: ProductCreate): Promise<Product> => {
    const response = await api.post('/products', product);
    return response.data;
  },

  // Update product
  updateProduct: async (id: number, product: ProductUpdate): Promise<Product> => {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  },

  // Delete product
  deleteProduct: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

export const cartApi = {
  // Get all cart items
  getCart: async (): Promise<CartItem[]> => {
    const response = await api.get('/cart');
    return response.data;
  },

  // Add product to cart
  addToCart: async (cartItem: CartItemCreate): Promise<CartItem> => {
    const response = await api.post('/cart', cartItem);
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (cartItemId: number): Promise<void> => {
    await api.delete(`/cart/${cartItemId}`);
  },

  // Clear entire cart
  clearCart: async (): Promise<void> => {
    await api.delete('/cart');
  },
};
