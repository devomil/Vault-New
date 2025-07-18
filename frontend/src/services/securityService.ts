import { api } from './api';

export interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType: 'login' | 'logout' | 'failed_login' | 'data_access' | 'data_modification' | 'system_change' | 'security_alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  userName: string;
  ipAddress: string;
  userAgent: string;
  description: string;
  resource: string;
  outcome: 'success' | 'failure' | 'blocked';
  metadata: Record<string, any>;
}

export interface ComplianceReport {
  id: string;
  reportType: 'gdpr' | 'sox' | 'pci' | 'hipaa' | 'custom';
  generatedAt: string;
  period: {
    start: string;
    end: string;
  };
  status: 'compliant' | 'non_compliant' | 'partial';
  summary: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    warnings: number;
  };
  findings: ComplianceFinding[];
}

export interface ComplianceFinding {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'ignored';
  recommendation: string;
  dueDate?: string;
  assignedTo?: string;
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  alertType: 'suspicious_activity' | 'failed_login' | 'data_breach' | 'system_vulnerability' | 'compliance_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  affectedUsers: string[];
  affectedResources: string[];
  recommendations: string[];
}

export interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  failedLogins: number;
  suspiciousActivities: number;
  complianceScore: number;
  lastAuditDate: string;
  activeAlerts: number;
  resolvedAlerts: number;
}

class SecurityService {
  // Get security events
  async getSecurityEvents(params?: {
    startDate?: string;
    endDate?: string;
    eventType?: string;
    severity?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  }): Promise<SecurityEvent[]> {
    try {
      const response = await api.get('/security/events', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch security events:', error);
      return [];
    }
  }

  // Get compliance reports
  async getComplianceReports(reportType?: string): Promise<ComplianceReport[]> {
    try {
      const response = await api.get('/security/compliance/reports', {
        params: { reportType }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch compliance reports:', error);
      return [];
    }
  }

  // Generate compliance report
  async generateComplianceReport(reportType: string, period: { start: string; end: string }): Promise<ComplianceReport> {
    try {
      const response = await api.post('/security/compliance/reports', {
        reportType,
        period
      });
      return response.data;
    } catch (error) {
      console.error('Failed to generate compliance report:', error);
      throw error;
    }
  }

  // Get security alerts
  async getSecurityAlerts(status?: string): Promise<SecurityAlert[]> {
    try {
      const response = await api.get('/security/alerts', { params: { status } });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch security alerts:', error);
      return [];
    }
  }

  // Update alert status
  async updateAlertStatus(alertId: string, status: string): Promise<void> {
    try {
      await api.patch(`/security/alerts/${alertId}`, { status });
    } catch (error) {
      console.error('Failed to update alert status:', error);
    }
  }

  // Get security metrics
  async getSecurityMetrics(): Promise<SecurityMetrics> {
    try {
      const response = await api.get('/security/metrics');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch security metrics:', error);
      return {
        totalEvents: 0,
        criticalEvents: 0,
        failedLogins: 0,
        suspiciousActivities: 0,
        complianceScore: 0,
        lastAuditDate: new Date().toISOString(),
        activeAlerts: 0,
        resolvedAlerts: 0,
      };
    }
  }

  // Get compliance findings
  async getComplianceFindings(status?: string): Promise<ComplianceFinding[]> {
    try {
      const response = await api.get('/security/compliance/findings', {
        params: { status }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch compliance findings:', error);
      return [];
    }
  }

  // Update finding status
  async updateFindingStatus(findingId: string, status: string, assignedTo?: string): Promise<void> {
    try {
      await api.patch(`/security/compliance/findings/${findingId}`, {
        status,
        assignedTo
      });
    } catch (error) {
      console.error('Failed to update finding status:', error);
    }
  }

  // Export audit log
  async exportAuditLog(params: {
    startDate: string;
    endDate: string;
    format: 'csv' | 'json' | 'pdf';
  }): Promise<Blob> {
    try {
      const response = await api.get('/security/audit/export', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to export audit log:', error);
      throw error;
    }
  }

  // Subscribe to security events (WebSocket simulation)
  subscribeToSecurityEvents(callback: (event: SecurityEvent) => void): () => void {
    const interval = setInterval(() => {
      const mockEvents: SecurityEvent[] = [
        {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          eventType: 'login',
          severity: 'low',
          userId: 'user123',
          userName: 'john.doe@example.com',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          description: 'User login successful',
          resource: '/api/auth/login',
          outcome: 'success',
          metadata: { location: 'New York, NY' }
        },
        {
          id: (Date.now() + 1).toString(),
          timestamp: new Date().toISOString(),
          eventType: 'failed_login',
          severity: 'medium',
          userId: 'unknown',
          userName: 'unknown@example.com',
          ipAddress: '203.0.113.1',
          userAgent: 'Mozilla/5.0...',
          description: 'Failed login attempt',
          resource: '/api/auth/login',
          outcome: 'failure',
          metadata: { attempts: 3 }
        }
      ];

      if (Math.random() < 0.2) {
        const randomEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)];
        callback(randomEvent);
      }
    }, 15000);

    return () => clearInterval(interval);
  }

  // Get real-time security metrics
  subscribeToSecurityMetrics(callback: (metrics: SecurityMetrics) => void): () => void {
    const interval = setInterval(async () => {
      try {
        const metrics = await this.getSecurityMetrics();
        callback(metrics);
      } catch (error) {
        console.error('Failed to fetch security metrics:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }
}

export const securityService = new SecurityService(); 