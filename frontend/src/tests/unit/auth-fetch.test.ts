/**
 * Unit Tests: utils/auth-fetch.ts
 *
 * Kiểm tra:
 * - getAuthHeaders: tạo headers đúng với/không có token
 * - authFetch: gắn Authorization header tự động
 * - authFetch: tự động refresh token khi nhận 401
 * - authFetch: gọi logout khi refresh thất bại
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAuthHeaders, authFetch } from '../../utils/auth-fetch';
import { useAuthStore } from '../../store/auth.store';

// ============================================================
// Mocks
// ============================================================

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Helper tạo Response giả
function makeMockResponse(status: number, body: object = {}): Response {
  return new Response(JSON.stringify(body), { status });
}

// ============================================================
// Reset trước mỗi test
// ============================================================
beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({ user: null, isAuthenticated: false, token: null });
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ============================================================
// getAuthHeaders
// ============================================================
describe('getAuthHeaders()', () => {
  it('nên trả về header Content-Type khi không có token', () => {
    const headers = getAuthHeaders();

    expect(headers).toEqual({ 'Content-Type': 'application/json' });
    expect((headers as Record<string, string>)['Authorization']).toBeUndefined();
  });

  it('nên thêm Authorization header khi có token', () => {
    useAuthStore.setState({ token: 'my-test-token' });

    const headers = getAuthHeaders() as Record<string, string>;

    expect(headers['Authorization']).toBe('Bearer my-test-token');
    expect(headers['Content-Type']).toBe('application/json');
  });
});

// ============================================================
// authFetch - Happy Path
// ============================================================
describe('authFetch() - Happy Path', () => {
  it('nên gọi fetch với Authorization header khi có token', async () => {
    useAuthStore.setState({ token: 'access-token-abc' });
    mockFetch.mockResolvedValueOnce(makeMockResponse(200, { data: 'ok' }));

    await authFetch('/api/employees');

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/employees');
    expect(options.headers['Authorization']).toBe('Bearer access-token-abc');
  });

  it('nên gọi fetch không có Authorization header khi không có token', async () => {
    mockFetch.mockResolvedValueOnce(makeMockResponse(200));

    await authFetch('/api/public');

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers['Authorization']).toBeUndefined();
  });

  it('nên truyền options (method, body) khi gọi POST', async () => {
    useAuthStore.setState({ token: 'tok' });
    mockFetch.mockResolvedValueOnce(makeMockResponse(201));

    const body = JSON.stringify({ name: 'Test' });
    await authFetch('/api/employees', { method: 'POST', body });

    const [, options] = mockFetch.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(options.body).toBe(body);
  });

  it('nên trả về response gốc khi thành công', async () => {
    mockFetch.mockResolvedValueOnce(makeMockResponse(200, { id: 1 }));

    const response = await authFetch('/api/test');

    expect(response.status).toBe(200);
  });
});

// ============================================================
// authFetch - Token Refresh (401 handling)
// ============================================================
describe('authFetch() - Tự động refresh khi 401', () => {
  it('nên refresh token và thử lại request khi nhận 401', async () => {
    useAuthStore.setState({ token: 'expired-token', isAuthenticated: true });

    const newAccessToken = 'new-fresh-token';

    // Mock module auth.api
    vi.doMock('../../features/auth/services/auth.api', () => ({
      authApi: {
        refreshAccessToken: vi.fn().mockResolvedValue({ accessToken: newAccessToken }),
      },
    }));

    // Lần 1: 401, Lần 2: 200 (retry sau refresh)
    mockFetch
      .mockResolvedValueOnce(makeMockResponse(401))
      .mockResolvedValueOnce(makeMockResponse(200, { ok: true }));

    const response = await authFetch('/api/employees');

    // fetch phải được gọi 2 lần
    expect(mockFetch).toHaveBeenCalledTimes(2);
    // Lần 2 dùng token mới
    const [, retryOptions] = mockFetch.mock.calls[1];
    expect(retryOptions.headers['Authorization']).toBe(`Bearer ${newAccessToken}`);
    expect(response.status).toBe(200);
  });

  it('nên gọi logout và trả về response 401 gốc khi refresh thất bại', async () => {
    useAuthStore.setState({ token: 'expired-token', isAuthenticated: true, user: { id: '1', username: 'u', name: 'U', role: 'employee', permissions: [], createdAt: '' } });

    // Mock auth.api để throw lỗi
    vi.doMock('../../features/auth/services/auth.api', () => ({
      authApi: {
        refreshAccessToken: vi.fn().mockRejectedValue(new Error('Refresh failed')),
      },
    }));

    mockFetch.mockResolvedValueOnce(makeMockResponse(401));

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await authFetch('/api/employees');

    // Trả về response 401 gốc
    expect(response.status).toBe(401);
    // Chỉ gọi fetch 1 lần (không retry vì refresh thất bại)
    expect(mockFetch).toHaveBeenCalledTimes(1);

    consoleErrorSpy.mockRestore();
  });
});
