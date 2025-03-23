/**
 * API Service Configuration
 * This file contains API endpoints and service methods for interacting with the backend.
 * Do not expose sensitive credentials in this file.
 */

// Type definitions for API data
export interface Category {
  id: string;
  name: string;
}

export interface InventoryItem {
  id: string;
  product: string;
  category: string;
  vendor: string;
  grossWt: string;
  fineWt: string;
  price: string;
  qty: number;
  settlement: string;
  dateAdded?: string;
  status?: string;
  location?: string;
  serialNumber?: string;
  description?: string;
  image?: string;
}

export interface PurchaseItem {
  id?: string;
  productName: string;
  category: string;
  vendor: string;
  grossWeight: string;
  stamp: string;
  wastage: string;
  purchaseMulti: string;
  fineWeight: string;
  todaysRate: string;
  discount?: string;
  purchasePrice: string;
  quantity: string;
  settlementMethod: string;
  rawMaterial?: string;
  remarks?: string;
  purchaseDate?: string;
}

export interface SaleItem {
  id?: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  products: string[];
  totalAmount: string;
  paymentMethod: string;
  paymentStatus: string;
  saleDate: string;
  salesPerson?: string;
  discountAmount?: string;
  taxAmount?: string;
  grandTotal: string;
  deliveryAddress?: string;
  deliveryDate?: string;
  orderStatus?: string;
  notes?: string;
}

/**
 * Base API configuration
 */
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://mao-backend2.your-username.workers.dev',
  ENDPOINTS: {
    CATEGORIES: '/api/categories',
    INVENTORY: '/api/inventory',
    PRODUCTS: '/api/products',
    PURCHASES: '/api/purchases',
    SALES: '/api/sales',
    CUSTOMERS: '/api/customers',
    VENDORS: '/api/vendors',
    SETTINGS: '/api/settings',
    USERS: '/api/users',
  },
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  }
};

/**
 * Generic fetch wrapper with error handling
 */
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;

    // Merge default headers with any provided headers
    const headers = {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

/**
 * API service methods
 */
export const apiService = {
  // Categories
  getCategories: () => fetchApi<Category[]>(API_CONFIG.ENDPOINTS.CATEGORIES),

  // Inventory
  getInventory: () => fetchApi<InventoryItem[]>(API_CONFIG.ENDPOINTS.INVENTORY),
  getInventoryItem: (id: string) => fetchApi<InventoryItem>(`${API_CONFIG.ENDPOINTS.INVENTORY}/${id}`),
  createInventoryItem: (data: InventoryItem) => fetchApi<InventoryItem>(API_CONFIG.ENDPOINTS.INVENTORY, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateInventoryItem: (id: string, data: Partial<InventoryItem>) => fetchApi<InventoryItem>(`${API_CONFIG.ENDPOINTS.INVENTORY}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteInventoryItem: (id: string) => fetchApi<{ success: boolean }>(`${API_CONFIG.ENDPOINTS.INVENTORY}/${id}`, {
    method: 'DELETE',
  }),

  // Purchases
  getPurchases: () => fetchApi<PurchaseItem[]>(API_CONFIG.ENDPOINTS.PURCHASES),
  createPurchase: (data: PurchaseItem) => fetchApi<PurchaseItem>(API_CONFIG.ENDPOINTS.PURCHASES, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Sales
  getSales: () => fetchApi<SaleItem[]>(API_CONFIG.ENDPOINTS.SALES),
  createSale: (data: SaleItem) => fetchApi<SaleItem>(API_CONFIG.ENDPOINTS.SALES, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // More API methods can be added here
};

export default apiService;
