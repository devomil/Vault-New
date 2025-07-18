export interface JwtPayload {
    tenantId: string;
    userId: string;
    role: string | undefined;
    permissions: string[] | undefined;
    exp: number;
}
export interface TokenOptions {
    tenantId: string;
    userId: string;
    role?: string;
    permissions?: string[];
    expiresIn?: string | number;
}
/**
 * Generate a JWT token for testing and development
 */
export declare function generateToken(options: TokenOptions): string;
/**
 * Verify and decode a JWT token
 */
export declare function verifyToken(token: string): JwtPayload | null;
/**
 * Generate test tokens for different scenarios
 */
export declare const TestTokens: {
    tenant1: string;
    tenant2: string;
    expired: string;
};
//# sourceMappingURL=jwt-utils.d.ts.map