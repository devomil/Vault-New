export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: Date;
}
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    timestamp: Date;
}
export declare enum Status {
    ACTIVE = "active",
    INACTIVE = "inactive",
    PENDING = "pending",
    SUSPENDED = "suspended",
    DELETED = "deleted"
}
export declare enum Priority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export interface Money {
    amount: number;
    currency: string;
}
export interface Currency {
    code: string;
    name: string;
    symbol: string;
    decimalPlaces: number;
}
export interface DateRange {
    startDate: Date;
    endDate: Date;
}
export interface Filter {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'ilike';
    value: string | number | boolean | string[] | number[];
}
export interface Sort {
    field: string;
    order: 'asc' | 'desc';
}
export interface Query {
    filters?: Filter[];
    sorts?: Sort[];
    pagination?: PaginationParams;
    search?: string;
}
export interface Audit {
    createdBy: string;
    createdAt: Date;
    updatedBy?: string;
    updatedAt?: Date;
    deletedBy?: string;
    deletedAt?: Date;
}
export interface Metadata {
    [key: string]: string | number | boolean | null;
}
export interface Configuration {
    [key: string]: unknown;
}
export interface Event<T = unknown> {
    id: string;
    type: string;
    data: T;
    timestamp: Date;
    source: string;
    version: string;
}
export interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    recipient: string;
    read: boolean;
    createdAt: Date;
    readAt?: Date;
}
export interface File {
    id: string;
    name: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    uploadedBy: string;
    uploadedAt: Date;
}
export interface Address {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
    email?: string;
}
export interface Contact {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: Address;
    type: 'customer' | 'vendor' | 'employee' | 'other';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export type Result<T, E = Error> = Success<T> | Failure<E>;
export interface Success<T> {
    success: true;
    data: T;
}
export interface Failure<E> {
    success: false;
    error: E;
}
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;
export interface ValidationError {
    field: string;
    message: string;
    code: string;
}
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}
export interface CacheEntry<T> {
    key: string;
    value: T;
    ttl: number;
    createdAt: Date;
    expiresAt: Date;
}
export interface RateLimit {
    limit: number;
    remaining: number;
    reset: Date;
    window: number;
}
export interface HealthCheck {
    service: string;
    status: 'healthy' | 'unhealthy' | 'degraded';
    timestamp: Date;
    details?: Record<string, unknown>;
}
export interface Metric {
    name: string;
    value: number;
    unit: string;
    timestamp: Date;
    tags?: Record<string, string>;
}
export interface Performance {
    responseTime: number;
    throughput: number;
    errorRate: number;
    timestamp: Date;
}
//# sourceMappingURL=common.d.ts.map