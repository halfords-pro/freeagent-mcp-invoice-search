// Configuration interface for environment variables
export interface InvoiceSearchConfig {
  apiUrl: string;        // Base URL for invoice API
  apiUsername: string;   // HTTP Basic Auth username
  apiToken: string;      // HTTP Basic Auth password/token
}

// Input parameters for search_invoice tool
export interface SearchParams {
  reference: string;     // Invoice reference (e.g., 'INV-011', '100056')
}

// Individual invoice structure (based on API response)
export interface Invoice {
  id: number;
  reference: string;
  customer_name?: string;
  amount?: number;
  currency?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  // Additional fields as discovered from API
  [key: string]: any;  // Allow for flexible API response structure
}

// API response wrapper
export interface SearchResponse {
  invoices: Invoice[];
  count: number;
  limit: number;
  offset: number;
}

// Health check response
export interface HealthResponse {
  status: string;      // e.g., "healthy"
  database: string;    // e.g., "connected"
}

// Statistics response
export interface StatsResponse {
  total_invoices: number;
  total_items: number;
  date_range: { [key: string]: string };
  status_breakdown: Array<{ [key: string]: any }>;
}
