import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface SecurityContext {
  ip: string;
  userAgent: string;
  timestamp: string;
  requestId: string;
  tenantId?: string;
}

export const securityMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // Log security events
  const securityContext: SecurityContext = {
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] as string || generateRequestId(),
    tenantId: req.headers['x-tenant-id'] as string
  };

  // Check for suspicious patterns
  if (isSuspiciousRequest(req, securityContext)) {
    logger.warn('Suspicious request detected', securityContext);
    res.status(403).json({
      error: 'Access denied',
      message: 'Request blocked for security reasons'
    });
    return;
  }

  // Add security context to request
  (req as any).securityContext = securityContext;
  next();
};

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function isSuspiciousRequest(req: Request, context: SecurityContext): boolean {
  // Check for SQL injection patterns
  const sqlPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter)\b)/i,
    /(\b(exec|execute|script|javascript|vbscript)\b)/i,
    /(\b(union|select|insert|update|delete|drop|create|alter)\s+.*\b)/i
  ];

  const requestBody = JSON.stringify(req.body || {});
  const queryString = req.url;
  const userAgent = context.userAgent.toLowerCase();

  // Check for SQL injection in body or query
  for (const pattern of sqlPatterns) {
    if (pattern.test(requestBody) || pattern.test(queryString)) {
      return true;
    }
  }

  // Check for suspicious user agents
  const suspiciousUserAgents = [
    'sqlmap', 'nmap', 'nikto', 'dirbuster', 'gobuster', 'wfuzz'
  ];

  for (const agent of suspiciousUserAgents) {
    if (userAgent.includes(agent)) {
      return true;
    }
  }

  // Check for excessive path traversal attempts
  if ((req.url.match(/\.\./g) || []).length > 2) {
    return true;
  }

  return false;
} 