"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsResponseSchema = exports.AnalyticsQuerySchema = exports.UpdateReportSchema = exports.CreateReportSchema = exports.ReportSchema = exports.ReportStatusSchema = exports.ReportTypeSchema = exports.UpdateDashboardSchema = exports.CreateDashboardSchema = exports.DashboardSchema = exports.DashboardTypeSchema = exports.CreateAnalyticsMetricSchema = exports.AnalyticsMetricSchema = exports.TimeRangeSchema = exports.MetricTypeSchema = void 0;
const zod_1 = require("zod");
// Analytics Metric Types
exports.MetricTypeSchema = zod_1.z.enum([
    'revenue',
    'orders',
    'products',
    'customers',
    'inventory',
    'performance',
    'trends'
]);
exports.TimeRangeSchema = zod_1.z.enum([
    'hour',
    'day',
    'week',
    'month',
    'quarter',
    'year'
]);
// Analytics Metric Schema
exports.AnalyticsMetricSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    tenantId: zod_1.z.string().cuid(),
    name: zod_1.z.string().min(1).max(100),
    type: exports.MetricTypeSchema,
    value: zod_1.z.number(),
    unit: zod_1.z.string().optional(),
    timeRange: exports.TimeRangeSchema,
    timestamp: zod_1.z.date(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
    createdAt: zod_1.z.date()
});
// Create Analytics Metric Types
exports.CreateAnalyticsMetricSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    type: exports.MetricTypeSchema,
    value: zod_1.z.number(),
    unit: zod_1.z.string().optional(),
    timeRange: exports.TimeRangeSchema,
    timestamp: zod_1.z.date().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional()
});
// Dashboard Types
exports.DashboardTypeSchema = zod_1.z.enum([
    'overview',
    'sales',
    'inventory',
    'performance',
    'custom'
]);
exports.DashboardSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    tenantId: zod_1.z.string().cuid(),
    name: zod_1.z.string().min(1).max(100),
    type: exports.DashboardTypeSchema,
    layout: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        type: zod_1.z.string(),
        position: zod_1.z.object({
            x: zod_1.z.number().int().min(0),
            y: zod_1.z.number().int().min(0),
            width: zod_1.z.number().int().min(1),
            height: zod_1.z.number().int().min(1)
        }),
        config: zod_1.z.record(zod_1.z.any()).optional()
    })),
    isDefault: zod_1.z.boolean().default(false),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
// Create Dashboard Types
exports.CreateDashboardSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    type: exports.DashboardTypeSchema,
    layout: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        type: zod_1.z.string(),
        position: zod_1.z.object({
            x: zod_1.z.number().int().min(0),
            y: zod_1.z.number().int().min(0),
            width: zod_1.z.number().int().min(1),
            height: zod_1.z.number().int().min(1)
        }),
        config: zod_1.z.record(zod_1.z.any()).optional()
    })).optional(),
    isDefault: zod_1.z.boolean().default(false)
});
// Update Dashboard Types
exports.UpdateDashboardSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    type: exports.DashboardTypeSchema.optional(),
    layout: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        type: zod_1.z.string(),
        position: zod_1.z.object({
            x: zod_1.z.number().int().min(0),
            y: zod_1.z.number().int().min(0),
            width: zod_1.z.number().int().min(1),
            height: zod_1.z.number().int().min(1)
        }),
        config: zod_1.z.record(zod_1.z.any()).optional()
    })).optional(),
    isDefault: zod_1.z.boolean().optional()
});
// Report Types
exports.ReportTypeSchema = zod_1.z.enum([
    'sales_report',
    'inventory_report',
    'performance_report',
    'trend_analysis',
    'custom_report'
]);
exports.ReportStatusSchema = zod_1.z.enum(['draft', 'published', 'archived']);
exports.ReportSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    tenantId: zod_1.z.string().cuid(),
    name: zod_1.z.string().min(1).max(100),
    type: exports.ReportTypeSchema,
    status: exports.ReportStatusSchema.default('draft'),
    description: zod_1.z.string().optional(),
    parameters: zod_1.z.record(zod_1.z.any()).optional(),
    data: zod_1.z.record(zod_1.z.any()).optional(),
    schedule: zod_1.z.object({
        frequency: zod_1.z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).optional(),
        nextRun: zod_1.z.date().optional(),
        recipients: zod_1.z.array(zod_1.z.string().email()).optional()
    }).optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
// Create Report Types
exports.CreateReportSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    type: exports.ReportTypeSchema,
    status: exports.ReportStatusSchema.optional(),
    description: zod_1.z.string().optional(),
    parameters: zod_1.z.record(zod_1.z.any()).optional(),
    schedule: zod_1.z.object({
        frequency: zod_1.z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).optional(),
        nextRun: zod_1.z.date().optional(),
        recipients: zod_1.z.array(zod_1.z.string().email()).optional()
    }).optional()
});
// Update Report Types
exports.UpdateReportSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    type: exports.ReportTypeSchema.optional(),
    status: exports.ReportStatusSchema.optional(),
    description: zod_1.z.string().optional(),
    parameters: zod_1.z.record(zod_1.z.any()).optional(),
    schedule: zod_1.z.object({
        frequency: zod_1.z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).optional(),
        nextRun: zod_1.z.date().optional(),
        recipients: zod_1.z.array(zod_1.z.string().email()).optional()
    }).optional()
});
// Analytics Query Types
exports.AnalyticsQuerySchema = zod_1.z.object({
    metrics: zod_1.z.array(zod_1.z.string()),
    dimensions: zod_1.z.array(zod_1.z.string()).optional(),
    filters: zod_1.z.record(zod_1.z.any()).optional(),
    timeRange: exports.TimeRangeSchema,
    startDate: zod_1.z.date().optional(),
    endDate: zod_1.z.date().optional(),
    limit: zod_1.z.number().int().positive().optional(),
    offset: zod_1.z.number().int().min(0).optional(),
    sort: zod_1.z.array(zod_1.z.object({
        field: zod_1.z.string(),
        direction: zod_1.z.enum(['asc', 'desc'])
    })).optional()
});
// Analytics Response Types
exports.AnalyticsResponseSchema = zod_1.z.object({
    data: zod_1.z.array(zod_1.z.record(zod_1.z.any())),
    total: zod_1.z.number().int().min(0),
    limit: zod_1.z.number().int().positive().optional(),
    offset: zod_1.z.number().int().min(0).optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional()
});
//# sourceMappingURL=analytics.js.map