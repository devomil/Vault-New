import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export interface AuditEvent {
  id: string;
  eventType: string;
  timestamp: string;
  tenantId: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityThreat {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  tenantId: string;
  ip?: string;
  userAgent?: string;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
}

export interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  tenantId: string;
  status: 'active' | 'acknowledged' | 'resolved';
  details: Record<string, any>;
}

export interface SecurityReport {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalEvents: number;
    totalThreats: number;
    totalAlerts: number;
    criticalEvents: number;
    highSeverityEvents: number;
  };
  threats: SecurityThreat[];
  alerts: SecurityAlert[];
  recommendations: string[];
}

export class AuditService {
  private events: Map<string, AuditEvent> = new Map();
  private threats: Map<string, SecurityThreat> = new Map();
  private alerts: Map<string, SecurityAlert> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Mock audit events
    const mockEvents: AuditEvent[] = [
      {
        id: 'event-001',
        eventType: 'AUTH_LOGIN',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        tenantId: 'tenant-001',
        userId: 'user-001',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        details: { success: true, username: 'admin' },
        severity: 'low'
      },
      {
        id: 'event-002',
        eventType: 'AUTH_FAILED_LOGIN',
        timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        tenantId: 'tenant-001',
        ip: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        details: { username: 'unknown_user', reason: 'Invalid credentials' },
        severity: 'medium'
      },
      {
        id: 'event-003',
        eventType: 'PERMISSION_DENIED',
        timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
        tenantId: 'tenant-001',
        userId: 'user-002',
        ip: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        details: { resource: 'admin_panel', action: 'access' },
        severity: 'medium'
      }
    ];

    mockEvents.forEach(event => {
      this.events.set(event.id, event);
    });

    // Mock security threats
    const mockThreats: SecurityThreat[] = [
      {
        id: 'threat-001',
        type: 'BRUTE_FORCE_ATTEMPT',
        severity: 'high',
        description: 'Multiple failed login attempts detected',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        tenantId: 'tenant-001',
        ip: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status: 'investigating'
      },
      {
        id: 'threat-002',
        type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        severity: 'medium',
        description: 'Attempt to access restricted resource',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        tenantId: 'tenant-001',
        ip: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status: 'open'
      }
    ];

    mockThreats.forEach(threat => {
      this.threats.set(threat.id, threat);
    });

    // Mock security alerts
    const mockAlerts: SecurityAlert[] = [
      {
        id: 'alert-001',
        type: 'BRUTE_FORCE_DETECTED',
        severity: 'high',
        message: 'Brute force attack detected from IP 192.168.1.101',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        tenantId: 'tenant-001',
        status: 'active',
        details: { ip: '192.168.1.101', failedAttempts: 15, timeWindow: '5 minutes' }
      },
      {
        id: 'alert-002',
        type: 'SUSPICIOUS_ACTIVITY',
        severity: 'medium',
        message: 'Unusual access pattern detected',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        tenantId: 'tenant-001',
        status: 'acknowledged',
        details: { userId: 'user-002', resource: 'admin_panel', timeOfDay: 'unusual' }
      }
    ];

    mockAlerts.forEach(alert => {
      this.alerts.set(alert.id, alert);
    });
  }

  async logEvent(eventType: string, details: Record<string, any>): Promise<void> {
    try {
      const event: AuditEvent = {
        id: uuidv4(),
        eventType,
        timestamp: new Date().toISOString(),
        tenantId: details['tenantId'] || 'unknown',
        userId: details['userId'] || '',
        ip: details['ip'] || '',
        userAgent: details['userAgent'] || '',
        details,
        severity: this.determineSeverity(eventType, details)
      };

      this.events.set(event.id, event);

      // Check if this event should trigger a threat or alert
      await this.analyzeEventForThreats(event);

      logger.info('Audit event logged', { eventId: event.id, eventType, tenantId: event.tenantId });
    } catch (error) {
      logger.error('Log event error:', error);
    }
  }

  async getEvents(filters: {
    tenantId?: string;
    startDate?: string;
    endDate?: string;
    eventType?: string;
    limit?: number;
  }): Promise<AuditEvent[]> {
    try {
      let events = Array.from(this.events.values());

      // Apply filters
      if (filters.tenantId) {
        events = events.filter(event => event.tenantId === filters.tenantId);
      }

      if (filters.startDate) {
        events = events.filter(event => event.timestamp >= filters.startDate!);
      }

      if (filters.endDate) {
        events = events.filter(event => event.timestamp <= filters.endDate!);
      }

      if (filters.eventType) {
        events = events.filter(event => event.eventType === filters.eventType);
      }

      // Sort by timestamp (newest first) and limit
      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      if (filters.limit) {
        events = events.slice(0, filters.limit);
      }

      return events;
    } catch (error) {
      logger.error('Get events error:', error);
      throw new Error('Failed to get audit events');
    }
  }

  async getEvent(eventId: string): Promise<AuditEvent | null> {
    try {
      return this.events.get(eventId) || null;
    } catch (error) {
      logger.error('Get event error:', error);
      throw new Error('Failed to get audit event');
    }
  }

  async generateSecurityReport(filters: {
    tenantId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<SecurityReport> {
    try {
      const startDate = filters.startDate || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // Last 24 hours
      const endDate = filters.endDate || new Date().toISOString();

      // Get events for the period
      const events = await this.getEvents({
        tenantId: filters.tenantId || '',
        startDate,
        endDate
      });

      // Get threats for the period
      const threats = Array.from(this.threats.values()).filter(threat => {
        if (filters.tenantId && threat.tenantId !== filters.tenantId) return false;
        if (threat.timestamp < startDate || threat.timestamp > endDate) return false;
        return true;
      });

      // Get alerts for the period
      const alerts = Array.from(this.alerts.values()).filter(alert => {
        if (filters.tenantId && alert.tenantId !== filters.tenantId) return false;
        if (alert.timestamp < startDate || alert.timestamp > endDate) return false;
        return true;
      });

      // Calculate summary
      const criticalEvents = events.filter(event => event.severity === 'critical').length;
      const highSeverityEvents = events.filter(event => event.severity === 'high').length;

      // Generate recommendations
      const recommendations = this.generateRecommendations(events, threats, alerts);

      const report: SecurityReport = {
        period: { startDate, endDate },
        summary: {
          totalEvents: events.length,
          totalThreats: threats.length,
          totalAlerts: alerts.length,
          criticalEvents,
          highSeverityEvents
        },
        threats,
        alerts,
        recommendations
      };

      logger.info('Security report generated', { tenantId: filters.tenantId, period: { startDate, endDate } });

      return report;
    } catch (error) {
      logger.error('Generate security report error:', error);
      throw new Error('Failed to generate security report');
    }
  }

  async getSecurityThreats(filters: {
    tenantId?: string;
    severity?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<SecurityThreat[]> {
    try {
      let threats = Array.from(this.threats.values());

      // Apply filters
      if (filters.tenantId) {
        threats = threats.filter(threat => threat.tenantId === filters.tenantId);
      }

      if (filters.severity) {
        threats = threats.filter(threat => threat.severity === filters.severity);
      }

      if (filters.startDate) {
        threats = threats.filter(threat => threat.timestamp >= filters.startDate!);
      }

      if (filters.endDate) {
        threats = threats.filter(threat => threat.timestamp <= filters.endDate!);
      }

      // Sort by timestamp (newest first)
      threats.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return threats;
    } catch (error) {
      logger.error('Get security threats error:', error);
      throw new Error('Failed to get security threats');
    }
  }

  async getSecurityAlerts(tenantId: string, status?: string): Promise<SecurityAlert[]> {
    try {
      let alerts = Array.from(this.alerts.values()).filter(alert => alert.tenantId === tenantId);

      if (status) {
        alerts = alerts.filter(alert => alert.status === status);
      }

      // Sort by timestamp (newest first)
      alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return alerts;
    } catch (error) {
      logger.error('Get security alerts error:', error);
      throw new Error('Failed to get security alerts');
    }
  }

  private determineSeverity(eventType: string, details: Record<string, any>): 'low' | 'medium' | 'high' | 'critical' {
    // Define severity based on event type and details
    switch (eventType) {
      case 'AUTH_LOGIN':
        return details['success'] ? 'low' : 'medium';
      case 'AUTH_FAILED_LOGIN':
        return 'medium';
      case 'PERMISSION_DENIED':
        return 'medium';
      case 'ADMIN_ACTION':
        return 'high';
      case 'SYSTEM_ERROR':
        return 'high';
      case 'SECURITY_BREACH':
        return 'critical';
      default:
        return 'low';
    }
  }

  private async analyzeEventForThreats(event: AuditEvent): Promise<void> {
    // Check for brute force attempts
    if (event.eventType === 'AUTH_FAILED_LOGIN') {
      const recentFailures = Array.from(this.events.values()).filter(e => 
        e.eventType === 'AUTH_FAILED_LOGIN' && 
        e.ip === event.ip && 
        e.tenantId === event.tenantId &&
        new Date(e.timestamp).getTime() > Date.now() - 5 * 60 * 1000 // Last 5 minutes
      );

      if (recentFailures.length >= 5) {
        await this.createThreat('BRUTE_FORCE_ATTEMPT', event);
        await this.createAlert('BRUTE_FORCE_DETECTED', event);
      }
    }

    // Check for unauthorized access attempts
    if (event.eventType === 'PERMISSION_DENIED') {
      await this.createThreat('UNAUTHORIZED_ACCESS_ATTEMPT', event);
    }
  }

  private async createThreat(type: string, event: AuditEvent): Promise<void> {
    const threat: SecurityThreat = {
      id: uuidv4(),
      type,
      severity: event.severity === 'critical' ? 'critical' : event.severity === 'high' ? 'high' : 'medium',
      description: `Security threat detected: ${type}`,
      timestamp: new Date().toISOString(),
      tenantId: event.tenantId,
      ip: event.ip || '',
      userAgent: event.userAgent || '',
      status: 'open'
    };

    this.threats.set(threat.id, threat);
    logger.warn('Security threat created', { threatId: threat.id, type, tenantId: event.tenantId });
  }

  private async createAlert(type: string, event: AuditEvent): Promise<void> {
    const alert: SecurityAlert = {
      id: uuidv4(),
      type,
      severity: event.severity === 'critical' ? 'critical' : event.severity === 'high' ? 'high' : 'medium',
      message: `Security alert: ${type} detected`,
      timestamp: new Date().toISOString(),
      tenantId: event.tenantId,
      status: 'active',
      details: { eventId: event.id, ip: event.ip, userAgent: event.userAgent }
    };

    this.alerts.set(alert.id, alert);
    logger.warn('Security alert created', { alertId: alert.id, type, tenantId: event.tenantId });
  }

  private generateRecommendations(events: AuditEvent[], threats: SecurityThreat[], alerts: SecurityAlert[]): string[] {
    const recommendations: string[] = [];

    // Analyze patterns and generate recommendations
    const failedLogins = events.filter(e => e.eventType === 'AUTH_FAILED_LOGIN').length;
    if (failedLogins > 10) {
      recommendations.push('Consider implementing account lockout policies after multiple failed login attempts');
    }

    const permissionDenials = events.filter(e => e.eventType === 'PERMISSION_DENIED').length;
    if (permissionDenials > 5) {
      recommendations.push('Review user permissions and access patterns to reduce unauthorized access attempts');
    }

    const criticalThreats = threats.filter(t => t.severity === 'critical').length;
    if (criticalThreats > 0) {
      recommendations.push('Immediate attention required: Critical security threats detected');
    }

    const activeAlerts = alerts.filter(a => a.status === 'active').length;
    if (activeAlerts > 3) {
      recommendations.push('Multiple active security alerts require investigation');
    }

    if (recommendations.length === 0) {
      recommendations.push('No immediate security concerns detected');
    }

    return recommendations;
  }
} 