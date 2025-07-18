import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Download, 
  Eye, 
  Lock, 
  Users,
  Activity,
  FileText,
  TrendingUp,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';
import { securityService, SecurityEvent, ComplianceReport, SecurityAlert, SecurityMetrics, ComplianceFinding } from '../services/securityService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const SecurityPage: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [findings, setFindings] = useState<ComplianceFinding[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
    const unsubscribeEvents = securityService.subscribeToSecurityEvents((newEvent) => {
      setEvents(prev => [newEvent, ...prev.slice(0, 99)]); // Keep last 100 events
    });

    const unsubscribeMetrics = securityService.subscribeToSecurityMetrics((newMetrics) => {
      setMetrics(newMetrics);
    });

    return () => {
      unsubscribeEvents();
      unsubscribeMetrics();
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eventsData, reportsData, alertsData, findingsData, metricsData] = await Promise.all([
        securityService.getSecurityEvents(),
        securityService.getComplianceReports(),
        securityService.getSecurityAlerts('active'),
        securityService.getComplianceFindings(),
        securityService.getSecurityMetrics()
      ]);
      
      setEvents(eventsData);
      setReports(reportsData);
      setAlerts(alertsData);
      setFindings(findingsData);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAlertStatus = async (alertId: string, status: string) => {
    await securityService.updateAlertStatus(alertId, status);
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const handleUpdateFindingStatus = async (findingId: string, status: string) => {
    await securityService.updateFindingStatus(findingId, status);
    setFindings(prev => 
      prev.map(finding => 
        finding.id === findingId ? { ...finding, status: status as any } : finding
      )
    );
  };

  const handleExportAuditLog = async () => {
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const blob = await securityService.exportAuditLog({
        startDate,
        endDate,
        format: 'csv'
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export audit log:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'login': return '🔐';
      case 'logout': return '🚪';
      case 'data_access': return '👁️';
      case 'data_modification': return '✏️';
      case 'system_change': return '⚙️';
      case 'security_alert': return '🚨';
      default: return '📝';
    }
  };

  const filteredEvents = events.filter(event =>
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.ipAddress.includes(searchTerm)
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Security & Compliance</h1>
          <p className="text-muted-foreground">Monitor security events, compliance status, and system integrity</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExportAuditLog}>
            <Download className="w-4 h-4 mr-2" />
            Export Audit Log
          </Button>
          <Button onClick={loadData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics ? `${metrics.complianceScore}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              Compliance rating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics?.activeAlerts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {alerts.filter(a => a.severity === 'critical').length} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.totalEvents || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metrics?.failedLogins || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Potential threats
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="findings">Compliance Findings</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Security Events</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select 
                    value={selectedPeriod} 
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredEvents.slice(0, 20)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="severity" stroke="#8884d8" name="Severity" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredEvents.slice(0, 10).map((event) => (
                  <div key={event.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      <span className="text-lg">{getEventTypeIcon(event.eventType)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">{event.description}</h4>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getSeverityColor(event.severity)}`} />
                          <span className="text-xs text-gray-500">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {event.userName} • {event.ipAddress}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {event.eventType}
                        </Badge>
                        <Badge variant={event.outcome === 'success' ? 'default' : 'destructive'} className="text-xs">
                          {event.outcome}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{report.reportType.toUpperCase()} Report</h4>
                        <Badge variant={report.status === 'compliant' ? 'default' : 'destructive'}>
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Generated: {new Date(report.generatedAt).toLocaleDateString()}
                      </p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span>Checks: {report.summary.passedChecks}/{report.summary.totalChecks}</span>
                        <span>Warnings: {report.summary.warnings}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Compliant', value: reports.filter(r => r.status === 'compliant').length },
                          { name: 'Non-Compliant', value: reports.filter(r => r.status === 'non_compliant').length },
                          { name: 'Partial', value: reports.filter(r => r.status === 'partial').length }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#82ca9d" />
                        <Cell fill="#ffc658" />
                        <Cell fill="#ff7300" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">No active security alerts</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium">{alert.title}</h4>
                            <Badge variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{alert.description}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span>Type: {alert.alertType}</span>
                            <span>Affected Users: {alert.affectedUsers.length}</span>
                            <span>Affected Resources: {alert.affectedResources.length}</span>
                          </div>
                          {alert.recommendations.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium mb-1">Recommendations:</p>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {alert.recommendations.map((rec, index) => (
                                  <li key={index}>• {rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdateAlertStatus(alert.id, 'investigating')}
                          >
                            Investigate
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUpdateAlertStatus(alert.id, 'resolved')}
                          >
                            Resolve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="findings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Findings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {findings.map((finding) => (
                  <div key={finding.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">{finding.title}</h4>
                          <Badge variant={finding.severity === 'critical' ? 'destructive' : 'default'}>
                            {finding.severity}
                          </Badge>
                          <Badge variant={finding.status === 'resolved' ? 'default' : 'secondary'}>
                            {finding.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{finding.description}</p>
                        <p className="text-sm text-gray-600 mb-3">
                          <strong>Recommendation:</strong> {finding.recommendation}
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span>Category: {finding.category}</span>
                          {finding.dueDate && (
                            <span>Due: {new Date(finding.dueDate).toLocaleDateString()}</span>
                          )}
                          {finding.assignedTo && (
                            <span>Assigned: {finding.assignedTo}</span>
                          )}
                        </div>
                      </div>
                      {finding.status !== 'resolved' && (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdateFindingStatus(finding.id, 'in_progress')}
                          >
                            Start
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUpdateFindingStatus(finding.id, 'resolved')}
                          >
                            Resolve
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityPage; 