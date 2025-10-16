/**
 * Utility functions for JWT handling
 */

/**
 * Simple JWT decoder - decodes the payload without validation
 * For production, use a proper JWT library with validation
 */
export function decodeJWT(token: string): any {
  try {
    // JWT structure: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    // Base64 decode the payload (middle part)
    const base64Payload = parts[1];
    const payload = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
    
    return JSON.parse(payload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Check if a JWT token is valid and not expired
 */
export function isValidJWT(token: string): boolean {
  try {
    const decoded = decodeJWT(token);
    
    if (!decoded) return false;
    
    // Check if token has expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      return false; // Token has expired
    }
    
    return true;
  } catch (error) {
    return false;
  }
}
