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
