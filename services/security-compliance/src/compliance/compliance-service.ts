import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export interface ComplianceCheck {
  id: string;
  name: string;
  framework: string;
  category: string;
  description: string;
  status: 'pass' | 'fail' | 'warning' | 'not_applicable';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  lastChecked: string;
  nextCheck: string;
}

export interface ComplianceStatus {
  framework: string;
  overallStatus: 'compliant' | 'non_compliant' | 'partial';
  complianceScore: number;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warningChecks: number;
  lastUpdated: string;
  nextReview: string;
}

export interface ComplianceReport {
  id: string;
  framework: string;
  tenantId: string;
  generatedAt: string;
  period: {
    startDate: string;
    endDate: string;
  };
  status: ComplianceStatus;
  checks: ComplianceCheck[];
  recommendations: string[];
  executiveSummary: string;
}

export class ComplianceService {
  private checks: Map<string, ComplianceCheck> = new Map();
  private reports: Map<string, ComplianceReport> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Mock compliance checks for different frameworks
    const mockChecks: ComplianceCheck[] = [
      // GDPR Compliance Checks
      {
        id: 'check-001',
        name: 'Data Encryption at Rest',
        framework: 'GDPR',
        category: 'Data Protection',
        description: 'Verify that sensitive data is encrypted when stored',
        status: 'pass',
        severity: 'high',
        details: { encryptionAlgorithm: 'AES-256', keyManagement: 'KMS' },
        lastChecked: new Date().toISOString(),
        nextCheck: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      },
      {
        id: 'check-002',
        name: 'Data Encryption in Transit',
        framework: 'GDPR',
        category: 'Data Protection',
        description: 'Verify that data is encrypted during transmission',
        status: 'pass',
        severity: 'high',
        details: { protocol: 'TLS 1.3', certificateValidation: 'enabled' },
        lastChecked: new Date().toISOString(),
        nextCheck: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'check-003',
        name: 'User Consent Management',
        framework: 'GDPR',
        category: 'Privacy',
        description: 'Verify that user consent is properly managed',
        status: 'warning',
        severity: 'medium',
        details: { consentTracking: 'partial', optOutMechanism: 'available' },
        lastChecked: new Date().toISOString(),
        nextCheck: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      },
      // SOC 2 Compliance Checks
      {
        id: 'check-004',
        name: 'Access Control',
        framework: 'SOC2',
        category: 'Security',
        description: 'Verify that access controls are properly implemented',
        status: 'pass',
        severity: 'high',
        details: { multiFactorAuth: 'enabled', roleBasedAccess: 'implemented' },
        lastChecked: new Date().toISOString(),
        nextCheck: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'check-005',
        name: 'Audit Logging',
        framework: 'SOC2',
        category: 'Monitoring',
        description: 'Verify that comprehensive audit logging is in place',
        status: 'pass',
        severity: 'medium',
        details: { logRetention: '1 year', logIntegrity: 'protected' },
        lastChecked: new Date().toISOString(),
        nextCheck: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      // PCI DSS Compliance Checks
      {
        id: 'check-006',
        name: 'Cardholder Data Protection',
        framework: 'PCI_DSS',
        category: 'Data Security',
        description: 'Verify that cardholder data is properly protected',
        status: 'fail',
        severity: 'critical',
        details: { dataEncryption: 'incomplete', dataRetention: 'exceeds_limit' },
        lastChecked: new Date().toISOString(),
        nextCheck: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day
      },
      {
        id: 'check-007',
        name: 'Vulnerability Management',
        framework: 'PCI_DSS',
        category: 'Security',
        description: 'Verify that vulnerability management processes are in place',
        status: 'pass',
        severity: 'high',
        details: { scanningFrequency: 'weekly', patchManagement: 'automated' },
        lastChecked: new Date().toISOString(),
        nextCheck: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    mockChecks.forEach(check => {
      this.checks.set(check.id, check);
    });
  }

  async getComplianceStatus(tenantId: string): Promise<ComplianceStatus[]> {
    try {
      const frameworks = ['GDPR', 'SOC2', 'PCI_DSS'];
      const statuses: ComplianceStatus[] = [];

      for (const framework of frameworks) {
        const frameworkChecks = Array.from(this.checks.values()).filter(
          check => check.framework === framework
        );

        const totalChecks = frameworkChecks.length;
        const passedChecks = frameworkChecks.filter(check => check.status === 'pass').length;
        const failedChecks = frameworkChecks.filter(check => check.status === 'fail').length;
        const warningChecks = frameworkChecks.filter(check => check.status === 'warning').length;

        const complianceScore = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0;

        let overallStatus: 'compliant' | 'non_compliant' | 'partial';
        if (failedChecks === 0 && warningChecks === 0) {
          overallStatus = 'compliant';
        } else if (failedChecks > 0) {
          overallStatus = 'non_compliant';
        } else {
          overallStatus = 'partial';
        }

        const status: ComplianceStatus = {
          framework,
          overallStatus,
          complianceScore: Math.round(complianceScore * 100) / 100,
          totalChecks,
          passedChecks,
          failedChecks,
          warningChecks,
          lastUpdated: new Date().toISOString(),
          nextReview: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };

        statuses.push(status);
      }

      logger.info('Compliance status retrieved', { tenantId, frameworks: frameworks.length });

      return statuses;
    } catch (error) {
      logger.error('Get compliance status error:', error);
      throw new Error('Failed to get compliance status');
    }
  }

  async getComplianceChecks(tenantId: string, framework?: string): Promise<ComplianceCheck[]> {
    try {
      let checks = Array.from(this.checks.values());

      if (framework) {
        checks = checks.filter(check => check.framework === framework);
      }

      // Sort by severity and status
      checks.sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const statusOrder = { fail: 4, warning: 3, pass: 2, not_applicable: 1 };
        
        const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
        if (severityDiff !== 0) return severityDiff;
        
        return statusOrder[b.status] - statusOrder[a.status];
      });

      logger.info('Compliance checks retrieved', { tenantId, framework, count: checks.length });

      return checks;
    } catch (error) {
      logger.error('Get compliance checks error:', error);
      throw new Error('Failed to get compliance checks');
    }
  }

  async runComplianceChecks(tenantId: string, framework: string, checkIds?: string[]): Promise<{ success: boolean; results: ComplianceCheck[]; error?: string }> {
    try {
      let checksToRun = Array.from(this.checks.values()).filter(
        check => check.framework === framework
      );

      if (checkIds && checkIds.length > 0) {
        checksToRun = checksToRun.filter(check => checkIds.includes(check.id));
      }

      const results: ComplianceCheck[] = [];

      for (const check of checksToRun) {
        // Simulate running the compliance check
        const updatedCheck = await this.runSingleCheck(check);
        this.checks.set(check.id, updatedCheck);
        results.push(updatedCheck);
      }

      logger.info('Compliance checks run successfully', { 
        tenantId, 
        framework, 
        checksRun: results.length,
        passed: results.filter(r => r.status === 'pass').length,
        failed: results.filter(r => r.status === 'fail').length
      });

      return {
        success: true,
        results
      };
    } catch (error) {
      logger.error('Run compliance checks error:', error);
      return {
        success: false,
        results: [],
        error: 'Failed to run compliance checks'
      };
    }
  }

  async getComplianceReports(filters: {
    tenantId?: string;
    framework?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ComplianceReport[]> {
    try {
      let reports = Array.from(this.reports.values());

      // Apply filters
      if (filters.tenantId) {
        reports = reports.filter(report => report.tenantId === filters.tenantId);
      }

      if (filters.framework) {
        reports = reports.filter(report => report.framework === filters.framework);
      }

      if (filters.startDate) {
        reports = reports.filter(report => report.generatedAt >= filters.startDate!);
      }

      if (filters.endDate) {
        reports = reports.filter(report => report.generatedAt <= filters.endDate!);
      }

      // Sort by generation date (newest first)
      reports.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());

      logger.info('Compliance reports retrieved', { 
        tenantId: filters.tenantId, 
        framework: filters.framework, 
        count: reports.length 
      });

      return reports;
    } catch (error) {
      logger.error('Get compliance reports error:', error);
      throw new Error('Failed to get compliance reports');
    }
  }

  async generateComplianceReport(tenantId: string, framework: string): Promise<{ success: boolean; report?: ComplianceReport; error?: string }> {
    try {
      const checks = await this.getComplianceChecks(tenantId, framework);
      const status = await this.getComplianceStatus(tenantId);
      const frameworkStatus = status.find(s => s.framework === framework);

      if (!frameworkStatus) {
        return {
          success: false,
          error: 'Framework status not found'
        };
      }

      const recommendations = this.generateRecommendations(checks);
      const executiveSummary = this.generateExecutiveSummary(frameworkStatus, checks);

      const report: ComplianceReport = {
        id: uuidv4(),
        framework,
        tenantId,
        generatedAt: new Date().toISOString(),
        period: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
          endDate: new Date().toISOString()
        },
        status: frameworkStatus,
        checks,
        recommendations,
        executiveSummary
      };

      this.reports.set(report.id, report);

      logger.info('Compliance report generated', { 
        reportId: report.id, 
        tenantId, 
        framework,
        complianceScore: frameworkStatus.complianceScore 
      });

      return {
        success: true,
        report
      };
    } catch (error) {
      logger.error('Generate compliance report error:', error);
      return {
        success: false,
        error: 'Failed to generate compliance report'
      };
    }
  }

  private async runSingleCheck(check: ComplianceCheck): Promise<ComplianceCheck> {
    // Simulate running a compliance check
    // In a real implementation, this would perform actual checks
    const updatedCheck = { ...check };
    
    // Simulate some checks failing or having warnings
    if (check.name.includes('Cardholder Data')) {
      updatedCheck.status = 'fail';
      updatedCheck.details = { 
        ...check.details, 
        reason: 'Data encryption not fully implemented',
        remediation: 'Implement AES-256 encryption for all cardholder data'
      };
    } else if (check.name.includes('User Consent')) {
      updatedCheck.status = 'warning';
      updatedCheck.details = { 
        ...check.details, 
        reason: 'Consent tracking needs improvement',
        remediation: 'Enhance consent management system'
      };
    } else {
      updatedCheck.status = 'pass';
    }

    updatedCheck.lastChecked = new Date().toISOString();
    updatedCheck.nextCheck = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    return updatedCheck;
  }

  private generateRecommendations(checks: ComplianceCheck[]): string[] {
    const recommendations: string[] = [];

    const failedChecks = checks.filter(check => check.status === 'fail');
    const warningChecks = checks.filter(check => check.status === 'warning');

    failedChecks.forEach(check => {
      if (check.details['remediation']) {
        recommendations.push(`CRITICAL: ${check.name} - ${check.details['remediation']}`);
      }
    });

    warningChecks.forEach(check => {
      if (check.details['remediation']) {
        recommendations.push(`WARNING: ${check.name} - ${check.details['remediation']}`);
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('All compliance checks are passing. Continue monitoring and regular reviews.');
    }

    return recommendations;
  }

  private generateExecutiveSummary(status: ComplianceStatus, checks: ComplianceCheck[]): string {
    const criticalFailures = checks.filter(check => check.status === 'fail' && check.severity === 'critical').length;
    const highFailures = checks.filter(check => check.status === 'fail' && check.severity === 'high').length;

    if (criticalFailures > 0) {
      return `CRITICAL: ${criticalFailures} critical compliance failures detected. Immediate action required to address security vulnerabilities.`;
    } else if (highFailures > 0) {
      return `HIGH PRIORITY: ${highFailures} high-severity compliance failures detected. Address these issues within 30 days.`;
    } else if (status.overallStatus === 'compliant') {
      return `COMPLIANT: All compliance requirements are met. Current compliance score: ${status.complianceScore}%.`;
    } else {
      return `PARTIAL COMPLIANCE: ${status.failedChecks} compliance failures detected. Review and address issues to achieve full compliance.`;
    }
  }
} 