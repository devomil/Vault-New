"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestTokens = void 0;
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
// JWT payload schema
const JwtPayloadSchema = zod_1.z.object({
    tenantId: zod_1.z.string(),
    userId: zod_1.z.string(),
    role: zod_1.z.string().optional(),
    permissions: zod_1.z.array(zod_1.z.string()).optional(),
    exp: zod_1.z.number()
});
/**
 * Generate a JWT token for testing and development
 */
function generateToken(options) {
    const payload = {
        tenantId: options.tenantId,
        userId: options.userId,
        role: options.role || 'user',
        permissions: options.permissions || ['read', 'write'],
        exp: Math.floor(Date.now() / 1000) + (typeof options.expiresIn === 'string' ?
            (options.expiresIn === '1h' ? 3600 : 86400) :
            (options.expiresIn || 3600))
    };
    const secret = process.env['JWT_SECRET'] || 'default-secret';
    return jsonwebtoken_1.default.sign(payload, secret);
}
/**
 * Verify and decode a JWT token
 */
function verifyToken(token) {
    try {
        const secret = process.env['JWT_SECRET'] || 'default-secret';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // Validate payload structure
        const validatedPayload = JwtPayloadSchema.parse(decoded);
        // Check if token is expired
        if (Date.now() >= validatedPayload.exp * 1000) {
            return null;
        }
        return validatedPayload;
    }
    catch (error) {
        return null;
    }
}
/**
 * Generate test tokens for different scenarios
 */
exports.TestTokens = {
    // Valid token for tenant-1
    tenant1: generateToken({
        tenantId: 'tenant-1',
        userId: 'user-1',
        role: 'admin',
        permissions: ['read', 'write', 'admin'],
        expiresIn: '1h'
    }),
    // Valid token for tenant-2
    tenant2: generateToken({
        tenantId: 'tenant-2',
        userId: 'user-2',
        role: 'user',
        permissions: ['read', 'write'],
        expiresIn: '1h'
    }),
    // Expired token
    expired: generateToken({
        tenantId: 'tenant-1',
        userId: 'user-1',
        role: 'user',
        permissions: ['read'],
        expiresIn: -3600 // Expired 1 hour ago
    })
};
//# sourceMappingURL=jwt-utils.js.map