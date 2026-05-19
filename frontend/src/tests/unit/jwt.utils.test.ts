/**
 * Unit Tests: jwt.utils.ts
 *
 * Kiểm tra hàm decodeJWT:
 * - Decode token hợp lệ thành công
 * - Trả về null khi token không hợp lệ
 * - Xử lý ký tự đặc biệt trong base64url
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { decodeJWT } from '../../utils/jwt.utils';

// ============================================================
// Helpers tạo JWT giả cho test
// ============================================================

/**
 * Tạo một chuỗi base64url từ object payload
 * Dùng Buffer vì jsdom cung cấp window.atob/btoa
 */
function createFakeJWT(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  const signature = 'fakesignature';
  return `${header}.${body}.${signature}`;
}

describe('decodeJWT', () => {
  describe('✅ Happy Path - Token hợp lệ', () => {
    it('nên decode token hợp lệ và trả về payload', () => {
      const payload = {
        sub: 'user-123',
        role: 'admin',
        permissions: ['manage_users', 'manage_roles'],
        iat: 1716000000,
        exp: 1716086400,
      };
      const token = createFakeJWT(payload);

      const result = decodeJWT(token);

      expect(result).not.toBeNull();
      expect(result.sub).toBe('user-123');
      expect(result.role).toBe('admin');
      expect(result.permissions).toEqual(['manage_users', 'manage_roles']);
      expect(result.iat).toBe(1716000000);
    });

    it('nên trả về payload chứa permissions rỗng', () => {
      const payload = { sub: 'emp-1', role: 'employee', permissions: [] };
      const token = createFakeJWT(payload);

      const result = decodeJWT(token);

      expect(result).not.toBeNull();
      expect(result.permissions).toEqual([]);
    });

    it('nên xử lý đúng ký tự đặc biệt trong base64url (-, _)', () => {
      // Payload có các ký tự sẽ tạo +/= khi mã hóa base64
      const payload = { note: 'hello+world/test=', role: 'hr' };
      const token = createFakeJWT(payload);

      const result = decodeJWT(token);

      expect(result).not.toBeNull();
      expect(result.role).toBe('hr');
    });
  });

  describe('❌ Error Path - Token không hợp lệ', () => {
    beforeEach(() => {
      // Suppress console.error trong tests lỗi
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('nên trả về null khi token là chuỗi rỗng', () => {
      const result = decodeJWT('');
      expect(result).toBeNull();
    });

    it('nên trả về null khi token chỉ có 1 phần (thiếu dấu .)', () => {
      const result = decodeJWT('onlyonepart');
      expect(result).toBeNull();
    });

    it('nên trả về null khi phần payload không phải base64 hợp lệ', () => {
      const result = decodeJWT('header.!!!invalid_base64!!.signature');
      expect(result).toBeNull();
    });

    it('nên trả về null khi payload decode được nhưng không phải JSON', () => {
      // Tạo payload base64 hợp lệ nhưng không phải JSON
      const fakePayload = btoa('this is not json');
      const result = decodeJWT(`header.${fakePayload}.signature`);
      expect(result).toBeNull();
    });
  });
});
