import { z } from 'zod';

// Account Types
export const AccountTypeSchema = z.enum([
  'asset',
  'liability',
  'equity',
  'revenue',
  'expense'
]);
export type AccountType = z.infer<typeof AccountTypeSchema>;

export const AccountStatusSchema = z.enum(['active', 'inactive', 'archived']);
export type AccountStatus = z.infer<typeof AccountStatusSchema>;

// Account Schema
export const AccountSchema = z.object({
  id: z.string().cuid(),
  tenantId: z.string().cuid(),
  accountNumber: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  type: AccountTypeSchema,
  status: AccountStatusSchema.default('active'),
  balance: z.number().default(0),
  currency: z.string().default('USD'),
  description: z.string().optional(),
  parentAccountId: z.string().cuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Create Account Types
export const CreateAccountSchema = z.object({
  accountNumber: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  type: AccountTypeSchema,
  status: AccountStatusSchema.optional(),
  balance: z.number().default(0),
  currency: z.string().default('USD'),
  description: z.string().optional(),
  parentAccountId: z.string().cuid().optional()
});

// Update Account Types
export const UpdateAccountSchema = z.object({
  accountNumber: z.string().min(1).max(20).optional(),
  name: z.string().min(1).max(100).optional(),
  type: AccountTypeSchema.optional(),
  status: AccountStatusSchema.optional(),
  balance: z.number().optional(),
  currency: z.string().optional(),
  description: z.string().optional(),
  parentAccountId: z.string().cuid().optional()
});

// Transaction Types
export const TransactionTypeSchema = z.enum([
  'sale',
  'purchase',
  'payment',
  'refund',
  'adjustment',
  'transfer',
  'expense',
  'income'
]);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

export const TransactionStatusSchema = z.enum(['pending', 'posted', 'cancelled', 'reversed']);
export type TransactionStatus = z.infer<typeof TransactionStatusSchema>;

// Transaction Schema
export const TransactionSchema = z.object({
  id: z.string().cuid(),
  tenantId: z.string().cuid(),
  transactionNumber: z.string().min(1).max(50),
  type: TransactionTypeSchema,
  status: TransactionStatusSchema.default('pending'),
  date: z.date(),
  amount: z.number(),
  currency: z.string().default('USD'),
  description: z.string().optional(),
  reference: z.string().optional(),
  entries: z.array(z.object({
    accountId: z.string().cuid(),
    debit: z.number().default(0),
    credit: z.number().default(0),
    description: z.string().optional()
  })),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Create Transaction Types
export const CreateTransactionEntrySchema = z.object({
  accountId: z.string().cuid(),
  debit: z.number().default(0),
  credit: z.number().default(0),
  description: z.string().optional()
});

export const CreateTransactionSchema = z.object({
  type: TransactionTypeSchema,
  status: TransactionStatusSchema.optional(),
  date: z.date(),
  amount: z.number(),
  currency: z.string().default('USD'),
  description: z.string().optional(),
  reference: z.string().optional(),
  entries: z.array(CreateTransactionEntrySchema)
});

// Update Transaction Types
export const UpdateTransactionSchema = z.object({
  type: TransactionTypeSchema.optional(),
  status: TransactionStatusSchema.optional(),
  date: z.date().optional(),
  amount: z.number().optional(),
  currency: z.string().optional(),
  description: z.string().optional(),
  reference: z.string().optional()
});

// Financial Report Types
export const ReportTypeSchema = z.enum([
  'balance_sheet',
  'income_statement',
  'cash_flow',
  'trial_balance',
  'general_ledger'
]);
export type ReportType = z.infer<typeof ReportTypeSchema>;

export const FinancialReportSchema = z.object({
  id: z.string().cuid(),
  tenantId: z.string().cuid(),
  type: ReportTypeSchema,
  period: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  data: z.record(z.any()),
  generatedAt: z.date(),
  createdAt: z.date()
});

// Create Financial Report Types
export const CreateFinancialReportSchema = z.object({
  type: ReportTypeSchema,
  period: z.string(),
  startDate: z.date(),
  endDate: z.date()
});

// Export types
export type Account = z.infer<typeof AccountSchema>;
export type CreateAccount = z.infer<typeof CreateAccountSchema>;
export type UpdateAccount = z.infer<typeof UpdateAccountSchema>;

export type Transaction = z.infer<typeof TransactionSchema>;
export type CreateTransaction = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransaction = z.infer<typeof UpdateTransactionSchema>;
export type CreateTransactionEntry = z.infer<typeof CreateTransactionEntrySchema>;

export type FinancialReport = z.infer<typeof FinancialReportSchema>;
export type CreateFinancialReport = z.infer<typeof CreateFinancialReportSchema>; 