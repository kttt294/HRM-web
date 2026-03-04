/**
 * Utilities for JWT manipulation on frontend
 */

/**
 * Decode JWT token without any library
 * JWT là 3 phần base64-encoded strings: header.payload.signature
 */
export function decodeJWT(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window.atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Lỗi giải mã token:', error);
        return null;
    }
}
