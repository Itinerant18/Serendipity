import { describe, it, expect, vi, beforeEach } from 'vitest';
import { API_URL, apiRequest } from '@/lib/api';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock auth store
vi.mock('@/utils/authStore', () => ({
  default: {
    getState: vi.fn().mockReturnValue({
      token: 'test-token',
    }),
  },
}));

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
  },
}));

describe('API Request Helper', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should have correct API_URL', () => {
    expect(API_URL).toBeDefined();
    expect(typeof API_URL).toBe('string');
  });

  it('should make GET request successfully', async () => {
    const mockProducts = [
      { id: 1, name: 'Product 1', price: 100 },
      { id: 2, name: 'Product 2', price: 200 },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    const result = await apiRequest('/api/products');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/products'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        }),
      })
    );
    expect(result).toEqual(mockProducts);
  });

  it('should make POST request with body', async () => {
    const newProduct = { name: 'New Product', price: 150 };
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 3, ...newProduct }),
    });

    const result = await apiRequest('/api/products', {
      method: 'POST',
      body: JSON.stringify(newProduct),
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/products'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(newProduct),
      })
    );
    expect(result.name).toBe('New Product');
  });

  it('should throw error on failed request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Not found' }),
    });

    await expect(apiRequest('/api/nonexistent')).rejects.toThrow('Not found');
  });
});
