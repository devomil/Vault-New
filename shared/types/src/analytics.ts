import { z } from 'zod';

// Analytics Metric Types
export const MetricTypeSchema = z.enum([
  'revenue',
  'orders',
  'products',
  'customers',
  'inventory',
  'performance',
  'trends'
]);
export type MetricType = z.infer<typeof MetricTypeSchema>;

export const TimeRangeSchema = z.enum([
  'hour',
  'day',
  'week',
  'month',
  'quarter',
  'year'
]);
export type TimeRange = z.infer<typeof TimeRangeSchema>;

// Analytics Metric Schema
export const AnalyticsMetricSchema = z.object({
  id: z.string().cuid(),
  tenantId: z.string().cuid(),
  name: z.string().min(1).max(100),
  type: MetricTypeSchema,
  value: z.number(),
  unit: z.string().optional(),
  timeRange: TimeRangeSchema,
  timestamp: z.date(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date()
});

// Create Analytics Metric Types
export const CreateAnalyticsMetricSchema = z.object({
  name: z.string().min(1).max(100),
  type: MetricTypeSchema,
  value: z.number(),
  unit: z.string().optional(),
  timeRange: TimeRangeSchema,
  timestamp: z.date().optional(),
  metadata: z.record(z.any()).optional()
});

// Dashboard Types
export const DashboardTypeSchema = z.enum([
  'overview',
  'sales',
  'inventory',
  'performance',
  'custom'
]);
export type DashboardType = z.infer<typeof DashboardTypeSchema>;

export const DashboardSchema = z.object({
  id: z.string().cuid(),
  tenantId: z.string().cuid(),
  name: z.string().min(1).max(100),
  type: DashboardTypeSchema,
  layout: z.array(z.object({
    id: z.string(),
    type: z.string(),
    position: z.object({
      x: z.number().int().min(0),
      y: z.number().int().min(0),
      width: z.number().int().min(1),
      height: z.number().int().min(1)
    }),
    config: z.record(z.any()).optional()
  })),
  isDefault: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Create Dashboard Types
export const CreateDashboardSchema = z.object({
  name: z.string().min(1).max(100),
  type: DashboardTypeSchema,
  layout: z.array(z.object({
    id: z.string(),
    type: z.string(),
    position: z.object({
      x: z.number().int().min(0),
      y: z.number().int().min(0),
      width: z.number().int().min(1),
      height: z.number().int().min(1)
    }),
    config: z.record(z.any()).optional()
  })).optional(),
  isDefault: z.boolean().default(false)
});

// Update Dashboard Types
export const UpdateDashboardSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: DashboardTypeSchema.optional(),
  layout: z.array(z.object({
    id: z.string(),
    type: z.string(),
    position: z.object({
      x: z.number().int().min(0),
      y: z.number().int().min(0),
      width: z.number().int().min(1),
      height: z.number().int().min(1)
    }),
    config: z.record(z.any()).optional()
  })).optional(),
  isDefault: z.boolean().optional()
});

// Report Types
export const ReportTypeSchema = z.enum([
  'sales_report',
  'inventory_report',
  'performance_report',
  'trend_analysis',
  'custom_report'
]);
export type ReportType = z.infer<typeof ReportTypeSchema>;

export const ReportStatusSchema = z.enum(['draft', 'published', 'archived']);
export type ReportStatus = z.infer<typeof ReportStatusSchema>;

export const ReportSchema = z.object({
  id: z.string().cuid(),
  tenantId: z.string().cuid(),
  name: z.string().min(1).max(100),
  type: ReportTypeSchema,
  status: ReportStatusSchema.default('draft'),
  description: z.string().optional(),
  parameters: z.record(z.any()).optional(),
  data: z.record(z.any()).optional(),
  schedule: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).optional(),
    nextRun: z.date().optional(),
    recipients: z.array(z.string().email()).optional()
  }).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Create Report Types
export const CreateReportSchema = z.object({
  name: z.string().min(1).max(100),
  type: ReportTypeSchema,
  status: ReportStatusSchema.optional(),
  description: z.string().optional(),
  parameters: z.record(z.any()).optional(),
  schedule: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).optional(),
    nextRun: z.date().optional(),
    recipients: z.array(z.string().email()).optional()
  }).optional()
});

// Update Report Types
export const UpdateReportSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: ReportTypeSchema.optional(),
  status: ReportStatusSchema.optional(),
  description: z.string().optional(),
  parameters: z.record(z.any()).optional(),
  schedule: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).optional(),
    nextRun: z.date().optional(),
    recipients: z.array(z.string().email()).optional()
  }).optional()
});

// Analytics Query Types
export const AnalyticsQuerySchema = z.object({
  metrics: z.array(z.string()),
  dimensions: z.array(z.string()).optional(),
  filters: z.record(z.any()).optional(),
  timeRange: TimeRangeSchema,
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().min(0).optional(),
  sort: z.array(z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc'])
  })).optional()
});

// Analytics Response Types
export const AnalyticsResponseSchema = z.object({
  data: z.array(z.record(z.any())),
  total: z.number().int().min(0),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().min(0).optional(),
  metadata: z.record(z.any()).optional()
});

// Export types
export type AnalyticsMetric = z.infer<typeof AnalyticsMetricSchema>;
export type CreateAnalyticsMetric = z.infer<typeof CreateAnalyticsMetricSchema>;

export type Dashboard = z.infer<typeof DashboardSchema>;
export type CreateDashboard = z.infer<typeof CreateDashboardSchema>;
export type UpdateDashboard = z.infer<typeof UpdateDashboardSchema>;

export type Report = z.infer<typeof ReportSchema>;
export type CreateReport = z.infer<typeof CreateReportSchema>;
export type UpdateReport = z.infer<typeof UpdateReportSchema>;

export type AnalyticsQuery = z.infer<typeof AnalyticsQuerySchema>;
export type AnalyticsResponse = z.infer<typeof AnalyticsResponseSchema>; 