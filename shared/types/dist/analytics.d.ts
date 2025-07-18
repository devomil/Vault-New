import { z } from 'zod';
export declare const MetricTypeSchema: z.ZodEnum<["revenue", "orders", "products", "customers", "inventory", "performance", "trends"]>;
export type MetricType = z.infer<typeof MetricTypeSchema>;
export declare const TimeRangeSchema: z.ZodEnum<["hour", "day", "week", "month", "quarter", "year"]>;
export type TimeRange = z.infer<typeof TimeRangeSchema>;
export declare const AnalyticsMetricSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<["revenue", "orders", "products", "customers", "inventory", "performance", "trends"]>;
    value: z.ZodNumber;
    unit: z.ZodOptional<z.ZodString>;
    timeRange: z.ZodEnum<["hour", "day", "week", "month", "quarter", "year"]>;
    timestamp: z.ZodDate;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    tenantId: string;
    name: string;
    type: "revenue" | "orders" | "products" | "customers" | "inventory" | "performance" | "trends";
    createdAt: Date;
    value: number;
    timeRange: "hour" | "day" | "week" | "month" | "quarter" | "year";
    timestamp: Date;
    unit?: string | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    id: string;
    tenantId: string;
    name: string;
    type: "revenue" | "orders" | "products" | "customers" | "inventory" | "performance" | "trends";
    createdAt: Date;
    value: number;
    timeRange: "hour" | "day" | "week" | "month" | "quarter" | "year";
    timestamp: Date;
    unit?: string | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export declare const CreateAnalyticsMetricSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<["revenue", "orders", "products", "customers", "inventory", "performance", "trends"]>;
    value: z.ZodNumber;
    unit: z.ZodOptional<z.ZodString>;
    timeRange: z.ZodEnum<["hour", "day", "week", "month", "quarter", "year"]>;
    timestamp: z.ZodOptional<z.ZodDate>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: "revenue" | "orders" | "products" | "customers" | "inventory" | "performance" | "trends";
    value: number;
    timeRange: "hour" | "day" | "week" | "month" | "quarter" | "year";
    unit?: string | undefined;
    timestamp?: Date | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    name: string;
    type: "revenue" | "orders" | "products" | "customers" | "inventory" | "performance" | "trends";
    value: number;
    timeRange: "hour" | "day" | "week" | "month" | "quarter" | "year";
    unit?: string | undefined;
    timestamp?: Date | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export declare const DashboardTypeSchema: z.ZodEnum<["overview", "sales", "inventory", "performance", "custom"]>;
export type DashboardType = z.infer<typeof DashboardTypeSchema>;
export declare const DashboardSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<["overview", "sales", "inventory", "performance", "custom"]>;
    layout: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        position: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
            width: number;
            height: number;
        }, {
            x: number;
            y: number;
            width: number;
            height: number;
        }>;
        config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: string;
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        config?: Record<string, any> | undefined;
    }, {
        id: string;
        type: string;
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        config?: Record<string, any> | undefined;
    }>, "many">;
    isDefault: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    tenantId: string;
    name: string;
    type: "custom" | "inventory" | "performance" | "overview" | "sales";
    createdAt: Date;
    updatedAt: Date;
    layout: {
        id: string;
        type: string;
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        config?: Record<string, any> | undefined;
    }[];
    isDefault: boolean;
}, {
    id: string;
    tenantId: string;
    name: string;
    type: "custom" | "inventory" | "performance" | "overview" | "sales";
    createdAt: Date;
    updatedAt: Date;
    layout: {
        id: string;
        type: string;
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        config?: Record<string, any> | undefined;
    }[];
    isDefault?: boolean | undefined;
}>;
export declare const CreateDashboardSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<["overview", "sales", "inventory", "performance", "custom"]>;
    layout: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        position: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
            width: number;
            height: number;
        }, {
            x: number;
            y: number;
            width: number;
            height: number;
        }>;
        config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: string;
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        config?: Record<string, any> | undefined;
    }, {
        id: string;
        type: string;
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        config?: Record<string, any> | undefined;
    }>, "many">>;
    isDefault: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: "custom" | "inventory" | "performance" | "overview" | "sales";
    isDefault: boolean;
    layout?: {
        id: string;
        type: string;
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        config?: Record<string, any> | undefined;
    }[] | undefined;
}, {
    name: string;
    type: "custom" | "inventory" | "performance" | "overview" | "sales";
    layout?: {
        id: string;
        type: string;
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        config?: Record<string, any> | undefined;
    }[] | undefined;
    isDefault?: boolean | undefined;
}>;
export declare const UpdateDashboardSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["overview", "sales", "inventory", "performance", "custom"]>>;
    layout: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        position: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
            width: number;
            height: number;
        }, {
            x: number;
            y: number;
            width: number;
            height: number;
        }>;
        config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: string;
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        config?: Record<string, any> | undefined;
    }, {
        id: string;
        type: string;
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        config?: Record<string, any> | undefined;
    }>, "many">>;
    isDefault: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    type?: "custom" | "inventory" | "performance" | "overview" | "sales" | undefined;
    layout?: {
        id: string;
        type: string;
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        config?: Record<string, any> | undefined;
    }[] | undefined;
    isDefault?: boolean | undefined;
}, {
    name?: string | undefined;
    type?: "custom" | "inventory" | "performance" | "overview" | "sales" | undefined;
    layout?: {
        id: string;
        type: string;
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        config?: Record<string, any> | undefined;
    }[] | undefined;
    isDefault?: boolean | undefined;
}>;
export declare const ReportTypeSchema: z.ZodEnum<["sales_report", "inventory_report", "performance_report", "trend_analysis", "custom_report"]>;
export type ReportType = z.infer<typeof ReportTypeSchema>;
export declare const ReportStatusSchema: z.ZodEnum<["draft", "published", "archived"]>;
export type ReportStatus = z.infer<typeof ReportStatusSchema>;
export declare const ReportSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<["sales_report", "inventory_report", "performance_report", "trend_analysis", "custom_report"]>;
    status: z.ZodDefault<z.ZodEnum<["draft", "published", "archived"]>>;
    description: z.ZodOptional<z.ZodString>;
    parameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    schedule: z.ZodOptional<z.ZodObject<{
        frequency: z.ZodOptional<z.ZodEnum<["daily", "weekly", "monthly", "quarterly", "yearly"]>>;
        nextRun: z.ZodOptional<z.ZodDate>;
        recipients: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        frequency?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | undefined;
        nextRun?: Date | undefined;
        recipients?: string[] | undefined;
    }, {
        frequency?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | undefined;
        nextRun?: Date | undefined;
        recipients?: string[] | undefined;
    }>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    tenantId: string;
    name: string;
    type: "sales_report" | "inventory_report" | "performance_report" | "trend_analysis" | "custom_report";
    status: "archived" | "draft" | "published";
    createdAt: Date;
    updatedAt: Date;
    description?: string | undefined;
    data?: Record<string, any> | undefined;
    parameters?: Record<string, any> | undefined;
    schedule?: {
        frequency?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | undefined;
        nextRun?: Date | undefined;
        recipients?: string[] | undefined;
    } | undefined;
}, {
    id: string;
    tenantId: string;
    name: string;
    type: "sales_report" | "inventory_report" | "performance_report" | "trend_analysis" | "custom_report";
    createdAt: Date;
    updatedAt: Date;
    status?: "archived" | "draft" | "published" | undefined;
    description?: string | undefined;
    data?: Record<string, any> | undefined;
    parameters?: Record<string, any> | undefined;
    schedule?: {
        frequency?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | undefined;
        nextRun?: Date | undefined;
        recipients?: string[] | undefined;
    } | undefined;
}>;
export declare const CreateReportSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<["sales_report", "inventory_report", "performance_report", "trend_analysis", "custom_report"]>;
    status: z.ZodOptional<z.ZodEnum<["draft", "published", "archived"]>>;
    description: z.ZodOptional<z.ZodString>;
    parameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    schedule: z.ZodOptional<z.ZodObject<{
        frequency: z.ZodOptional<z.ZodEnum<["daily", "weekly", "monthly", "quarterly", "yearly"]>>;
        nextRun: z.ZodOptional<z.ZodDate>;
        recipients: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        frequency?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | undefined;
        nextRun?: Date | undefined;
        recipients?: string[] | undefined;
    }, {
        frequency?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | undefined;
        nextRun?: Date | undefined;
        recipients?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: "sales_report" | "inventory_report" | "performance_report" | "trend_analysis" | "custom_report";
    status?: "archived" | "draft" | "published" | undefined;
    description?: string | undefined;
    parameters?: Record<string, any> | undefined;
    schedule?: {
        frequency?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | undefined;
        nextRun?: Date | undefined;
        recipients?: string[] | undefined;
    } | undefined;
}, {
    name: string;
    type: "sales_report" | "inventory_report" | "performance_report" | "trend_analysis" | "custom_report";
    status?: "archived" | "draft" | "published" | undefined;
    description?: string | undefined;
    parameters?: Record<string, any> | undefined;
    schedule?: {
        frequency?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | undefined;
        nextRun?: Date | undefined;
        recipients?: string[] | undefined;
    } | undefined;
}>;
export declare const UpdateReportSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["sales_report", "inventory_report", "performance_report", "trend_analysis", "custom_report"]>>;
    status: z.ZodOptional<z.ZodEnum<["draft", "published", "archived"]>>;
    description: z.ZodOptional<z.ZodString>;
    parameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    schedule: z.ZodOptional<z.ZodObject<{
        frequency: z.ZodOptional<z.ZodEnum<["daily", "weekly", "monthly", "quarterly", "yearly"]>>;
        nextRun: z.ZodOptional<z.ZodDate>;
        recipients: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        frequency?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | undefined;
        nextRun?: Date | undefined;
        recipients?: string[] | undefined;
    }, {
        frequency?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | undefined;
        nextRun?: Date | undefined;
        recipients?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    type?: "sales_report" | "inventory_report" | "performance_report" | "trend_analysis" | "custom_report" | undefined;
    status?: "archived" | "draft" | "published" | undefined;
    description?: string | undefined;
    parameters?: Record<string, any> | undefined;
    schedule?: {
        frequency?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | undefined;
        nextRun?: Date | undefined;
        recipients?: string[] | undefined;
    } | undefined;
}, {
    name?: string | undefined;
    type?: "sales_report" | "inventory_report" | "performance_report" | "trend_analysis" | "custom_report" | undefined;
    status?: "archived" | "draft" | "published" | undefined;
    description?: string | undefined;
    parameters?: Record<string, any> | undefined;
    schedule?: {
        frequency?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | undefined;
        nextRun?: Date | undefined;
        recipients?: string[] | undefined;
    } | undefined;
}>;
export declare const AnalyticsQuerySchema: z.ZodObject<{
    metrics: z.ZodArray<z.ZodString, "many">;
    dimensions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    filters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    timeRange: z.ZodEnum<["hour", "day", "week", "month", "quarter", "year"]>;
    startDate: z.ZodOptional<z.ZodDate>;
    endDate: z.ZodOptional<z.ZodDate>;
    limit: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
    sort: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        direction: z.ZodEnum<["asc", "desc"]>;
    }, "strip", z.ZodTypeAny, {
        field: string;
        direction: "asc" | "desc";
    }, {
        field: string;
        direction: "asc" | "desc";
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    timeRange: "hour" | "day" | "week" | "month" | "quarter" | "year";
    metrics: string[];
    sort?: {
        field: string;
        direction: "asc" | "desc";
    }[] | undefined;
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    dimensions?: string[] | undefined;
    filters?: Record<string, any> | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}, {
    timeRange: "hour" | "day" | "week" | "month" | "quarter" | "year";
    metrics: string[];
    sort?: {
        field: string;
        direction: "asc" | "desc";
    }[] | undefined;
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    dimensions?: string[] | undefined;
    filters?: Record<string, any> | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export declare const AnalyticsResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodAny>, "many">;
    total: z.ZodNumber;
    limit: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    data: Record<string, any>[];
    total: number;
    metadata?: Record<string, any> | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}, {
    data: Record<string, any>[];
    total: number;
    metadata?: Record<string, any> | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
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
//# sourceMappingURL=analytics.d.ts.map