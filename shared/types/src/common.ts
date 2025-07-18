// Common utility types and interfaces

// Base entity interface
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Pagination interface
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

// API response interfaces
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

// Status enums
export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Currency and money types
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

// Date range interface
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Filter interface
export interface Filter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'ilike';
  value: string | number | boolean | string[] | number[];
}

// Sort interface
export interface Sort {
  field: string;
  order: 'asc' | 'desc';
}

// Query interface
export interface Query {
  filters?: Filter[];
  sorts?: Sort[];
  pagination?: PaginationParams;
  search?: string;
}

// Audit interface
export interface Audit {
  createdBy: string;
  createdAt: Date;
  updatedBy?: string;
  updatedAt?: Date;
  deletedBy?: string;
  deletedAt?: Date;
}

// Metadata interface
export interface Metadata {
  [key: string]: string | number | boolean | null;
}

// Configuration interface
export interface Configuration {
  [key: string]: unknown;
}

// Event interface
export interface Event<T = unknown> {
  id: string;
  type: string;
  data: T;
  timestamp: Date;
  source: string;
  version: string;
}

// Notification interface
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

// File interface
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

// Address interface
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
}

// Contact interface
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

// Result types for error handling
export type Result<T, E = Error> = Success<T> | Failure<E>;

export interface Success<T> {
  success: true;
  data: T;
}

export interface Failure<E> {
  success: false;
  error: E;
}

// Async result type
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

// Validation error interface
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Cache interface
export interface CacheEntry<T> {
  key: string;
  value: T;
  ttl: number; // Time to live in seconds
  createdAt: Date;
  expiresAt: Date;
}

// Rate limiting interface
export interface RateLimit {
  limit: number;
  remaining: number;
  reset: Date;
  window: number; // Window size in seconds
}

// Health check interface
export interface HealthCheck {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  details?: Record<string, unknown>;
}

// Metrics interface
export interface Metric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

// Performance interface
export interface Performance {
  responseTime: number; // in milliseconds
  throughput: number; // requests per second
  errorRate: number; // percentage
  timestamp: Date;
} 