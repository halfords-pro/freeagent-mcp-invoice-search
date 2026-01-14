import axios, { AxiosInstance, AxiosError } from 'axios';
import { InvoiceSearchConfig, SearchParams, SearchResponse } from './types.js';

export class FreeagentInvoiceCacheClient {
  private axiosInstance: AxiosInstance;
  private config: InvoiceSearchConfig;

  constructor(config: InvoiceSearchConfig) {
    this.config = config;

    // Initialize axios with base configuration
    this.axiosInstance = axios.create({
      baseURL: config.apiUrl,
      auth: {
        username: config.apiUsername,
        password: config.apiToken,
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        this.logError('API request failed', error);
        return Promise.reject(error);
      }
    );
  }

  // Main search method
  async searchInvoice(params: SearchParams): Promise<SearchResponse> {
    console.error('[InvoiceCache] Searching for invoice:', params.reference);

    try {
      const response = await this.axiosInstance.get<SearchResponse>('/api/invoices', {
        params: {
          reference: params.reference,
        },
      });

      console.error('[InvoiceCache] Search completed:', {
        count: response.data.count,
        found: response.data.invoices.length,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const message = error.response?.data?.message || error.message;

        console.error('[InvoiceCache] HTTP Error:', {
          status: statusCode,
          message: message,
        });

        throw new Error(`Invoice API error (${statusCode}): ${message}`);
      }
      throw error;
    }
  }

  // Helper method for consistent error logging
  private logError(context: string, error: unknown): void {
    console.error(`[InvoiceCache] ${context}:`, {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
