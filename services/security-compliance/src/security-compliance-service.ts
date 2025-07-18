import express from 'express';
import { AuthenticationService } from './auth/authentication-service';
import { AuthorizationService } from './auth/authorization-service';
import { AuditService } from './audit/audit-service';
import { ComplianceService } from './compliance/compliance-service';
import { EncryptionService } from './encryption/encryption-service';
import { logger } from './utils/logger';

const router = express.Router();

// Initialize services
const authenticationService = new AuthenticationService();
const authorizationService = new AuthorizationService();
const auditService = new AuditService();
const complianceService = new ComplianceService();
const encryptionService = new EncryptionService();

// Authentication Endpoints
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password, tenantId } = req.body;
    const start = Date.now();
    
    const result = await authenticationService.login(username, password, tenantId);
    const duration = Date.now() - start;
    
    // Audit the login attempt
    await auditService.logEvent('AUTH_LOGIN', {
      username,
      tenantId,
      success: result.success,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      duration
    });
    
    res.json(result);
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
});

router.post('/auth/logout', async (req, res) => {
  try {
    const { token, tenantId } = req.body;
    const start = Date.now();
    
    const result = await authenticationService.logout(token, tenantId);
    const duration = Date.now() - start;
    
    // Audit the logout
    await auditService.logEvent('AUTH_LOGOUT', {
      tenantId,
      success: result.success,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      duration
    });
    
    res.json(result);
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

router.post('/auth/refresh', async (req, res) => {
  try {
    const { refreshToken, tenantId } = req.body;
    const result = await authenticationService.refreshToken(refreshToken, tenantId);
    res.json(result);
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Token refresh failed'
    });
  }
});

router.post('/auth/validate', async (req, res) => {
  try {
    const { token, tenantId } = req.body;
    const result = await authenticationService.validateToken(token, tenantId);
    res.json(result);
  } catch (error) {
    logger.error('Token validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Token validation failed'
    });
  }
});

// Authorization Endpoints
router.post('/auth/check-permission', async (req, res) => {
  try {
    const { token, resource, action, tenantId } = req.body;
    const result = await authorizationService.checkPermission(token, resource, action, tenantId);
    res.json(result);
  } catch (error) {
    logger.error('Permission check error:', error);
    res.status(500).json({
      success: false,
      error: 'Permission check failed'
    });
  }
});

router.get('/auth/roles', async (req, res) => {
  try {
    const { tenantId } = req.query;
    const roles = await authorizationService.getRoles(tenantId as string);
    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    logger.error('Get roles error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get roles'
    });
  }
});

router.post('/auth/roles', async (req, res) => {
  try {
    const { name, permissions, tenantId } = req.body;
    const result = await authorizationService.createRole(name, permissions, tenantId);
    res.json(result);
  } catch (error) {
    logger.error('Create role error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create role'
    });
  }
});

// Audit Endpoints
router.get('/audit/events', async (req, res) => {
  try {
    const { tenantId, startDate, endDate, eventType, limit = 100 } = req.query;
    const events = await auditService.getEvents({
      tenantId: tenantId as string,
      startDate: startDate as string,
      endDate: endDate as string,
      eventType: eventType as string,
      limit: parseInt(limit as string)
    });
    
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    logger.error('Get audit events error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get audit events'
    });
  }
});

router.get('/audit/events/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await auditService.getEvent(eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    res.json({
      success: true,
      data: event
    });
    return;
  } catch (error) {
    logger.error('Get audit event error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get audit event'
    });
    return;
  }
});

router.get('/audit/reports/security', async (req, res) => {
  try {
    const { tenantId, startDate, endDate } = req.query;
    const report = await auditService.generateSecurityReport({
      tenantId: tenantId as string,
      startDate: startDate as string,
      endDate: endDate as string
    });
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('Generate security report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate security report'
    });
  }
});

// Compliance Endpoints
router.get('/compliance/status', async (req, res) => {
  try {
    const { tenantId } = req.query;
    const status = await complianceService.getComplianceStatus(tenantId as string);
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Get compliance status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get compliance status'
    });
  }
});

router.get('/compliance/checks', async (req, res) => {
  try {
    const { tenantId, framework } = req.query;
    const checks = await complianceService.getComplianceChecks(tenantId as string, framework as string);
    res.json({
      success: true,
      data: checks
    });
  } catch (error) {
    logger.error('Get compliance checks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get compliance checks'
    });
  }
});

router.post('/compliance/checks/run', async (req, res) => {
  try {
    const { tenantId, framework, checks } = req.body;
    const result = await complianceService.runComplianceChecks(tenantId, framework, checks);
    res.json(result);
  } catch (error) {
    logger.error('Run compliance checks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to run compliance checks'
    });
  }
});

router.get('/compliance/reports', async (req, res) => {
  try {
    const { tenantId, framework, startDate, endDate } = req.query;
    const reports = await complianceService.getComplianceReports({
      tenantId: tenantId as string,
      framework: framework as string,
      startDate: startDate as string,
      endDate: endDate as string
    });
    
    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    logger.error('Get compliance reports error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get compliance reports'
    });
  }
});

// Encryption Endpoints
router.post('/encryption/encrypt', async (req, res) => {
  try {
    const { data, keyId, tenantId } = req.body;
    const encrypted = await encryptionService.encrypt(data, keyId, tenantId);
    res.json({
      success: true,
      data: encrypted
    });
  } catch (error) {
    logger.error('Encryption error:', error);
    res.status(500).json({
      success: false,
      error: 'Encryption failed'
    });
  }
});

router.post('/encryption/decrypt', async (req, res) => {
  try {
    const { encryptedData, keyId, tenantId } = req.body;
    const decrypted = await encryptionService.decrypt(encryptedData, keyId, tenantId);
    res.json({
      success: true,
      data: decrypted
    });
  } catch (error) {
    logger.error('Decryption error:', error);
    res.status(500).json({
      success: false,
      error: 'Decryption failed'
    });
  }
});

router.get('/encryption/keys', async (req, res) => {
  try {
    const { tenantId } = req.query;
    const keys = await encryptionService.getKeys(tenantId as string);
    res.json({
      success: true,
      data: keys
    });
  } catch (error) {
    logger.error('Get encryption keys error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get encryption keys'
    });
  }
});

router.post('/encryption/keys', async (req, res) => {
  try {
    const { name, type, tenantId } = req.body;
    const result = await encryptionService.createKey(name, type, tenantId);
    res.json(result);
  } catch (error) {
    logger.error('Create encryption key error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create encryption key'
    });
  }
});

// Security Monitoring Endpoints
router.get('/security/threats', async (req, res) => {
  try {
    const { tenantId, severity, startDate, endDate } = req.query;
    const threats = await auditService.getSecurityThreats({
      tenantId: tenantId as string,
      severity: severity as string,
      startDate: startDate as string,
      endDate: endDate as string
    });
    
    res.json({
      success: true,
      data: threats
    });
  } catch (error) {
    logger.error('Get security threats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get security threats'
    });
  }
});

router.get('/security/alerts', async (req, res) => {
  try {
    const { tenantId, status } = req.query;
    const alerts = await auditService.getSecurityAlerts(tenantId as string, status as string);
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    logger.error('Get security alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get security alerts'
    });
  }
});

export { router as securityComplianceService }; 