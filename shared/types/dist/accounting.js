"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateFinancialReportSchema = exports.FinancialReportSchema = exports.ReportTypeSchema = exports.UpdateTransactionSchema = exports.CreateTransactionSchema = exports.CreateTransactionEntrySchema = exports.TransactionSchema = exports.TransactionStatusSchema = exports.TransactionTypeSchema = exports.UpdateAccountSchema = exports.CreateAccountSchema = exports.AccountSchema = exports.AccountStatusSchema = exports.AccountTypeSchema = void 0;
const zod_1 = require("zod");
// Account Types
exports.AccountTypeSchema = zod_1.z.enum([
    'asset',
    'liability',
    'equity',
    'revenue',
    'expense'
]);
exports.AccountStatusSchema = zod_1.z.enum(['active', 'inactive', 'archived']);
// Account Schema
exports.AccountSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    tenantId: zod_1.z.string().cuid(),
    accountNumber: zod_1.z.string().min(1).max(20),
    name: zod_1.z.string().min(1).max(100),
    type: exports.AccountTypeSchema,
    status: exports.AccountStatusSchema.default('active'),
    balance: zod_1.z.number().default(0),
    currency: zod_1.z.string().default('USD'),
    description: zod_1.z.string().optional(),
    parentAccountId: zod_1.z.string().cuid().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
// Create Account Types
exports.CreateAccountSchema = zod_1.z.object({
    accountNumber: zod_1.z.string().min(1).max(20),
    name: zod_1.z.string().min(1).max(100),
    type: exports.AccountTypeSchema,
    status: exports.AccountStatusSchema.optional(),
    balance: zod_1.z.number().default(0),
    currency: zod_1.z.string().default('USD'),
    description: zod_1.z.string().optional(),
    parentAccountId: zod_1.z.string().cuid().optional()
});
// Update Account Types
exports.UpdateAccountSchema = zod_1.z.object({
    accountNumber: zod_1.z.string().min(1).max(20).optional(),
    name: zod_1.z.string().min(1).max(100).optional(),
    type: exports.AccountTypeSchema.optional(),
    status: exports.AccountStatusSchema.optional(),
    balance: zod_1.z.number().optional(),
    currency: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    parentAccountId: zod_1.z.string().cuid().optional()
});
// Transaction Types
exports.TransactionTypeSchema = zod_1.z.enum([
    'sale',
    'purchase',
    'payment',
    'refund',
    'adjustment',
    'transfer',
    'expense',
    'income'
]);
exports.TransactionStatusSchema = zod_1.z.enum(['pending', 'posted', 'cancelled', 'reversed']);
// Transaction Schema
exports.TransactionSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    tenantId: zod_1.z.string().cuid(),
    transactionNumber: zod_1.z.string().min(1).max(50),
    type: exports.TransactionTypeSchema,
    status: exports.TransactionStatusSchema.default('pending'),
    date: zod_1.z.date(),
    amount: zod_1.z.number(),
    currency: zod_1.z.string().default('USD'),
    description: zod_1.z.string().optional(),
    reference: zod_1.z.string().optional(),
    entries: zod_1.z.array(zod_1.z.object({
        accountId: zod_1.z.string().cuid(),
        debit: zod_1.z.number().default(0),
        credit: zod_1.z.number().default(0),
        description: zod_1.z.string().optional()
    })),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
// Create Transaction Types
exports.CreateTransactionEntrySchema = zod_1.z.object({
    accountId: zod_1.z.string().cuid(),
    debit: zod_1.z.number().default(0),
    credit: zod_1.z.number().default(0),
    description: zod_1.z.string().optional()
});
exports.CreateTransactionSchema = zod_1.z.object({
    type: exports.TransactionTypeSchema,
    status: exports.TransactionStatusSchema.optional(),
    date: zod_1.z.date(),
    amount: zod_1.z.number(),
    currency: zod_1.z.string().default('USD'),
    description: zod_1.z.string().optional(),
    reference: zod_1.z.string().optional(),
    entries: zod_1.z.array(exports.CreateTransactionEntrySchema)
});
// Update Transaction Types
exports.UpdateTransactionSchema = zod_1.z.object({
    type: exports.TransactionTypeSchema.optional(),
    status: exports.TransactionStatusSchema.optional(),
    date: zod_1.z.date().optional(),
    amount: zod_1.z.number().optional(),
    currency: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    reference: zod_1.z.string().optional()
});
// Financial Report Types
exports.ReportTypeSchema = zod_1.z.enum([
    'balance_sheet',
    'income_statement',
    'cash_flow',
    'trial_balance',
    'general_ledger'
]);
exports.FinancialReportSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    tenantId: zod_1.z.string().cuid(),
    type: exports.ReportTypeSchema,
    period: zod_1.z.string(),
    startDate: zod_1.z.date(),
    endDate: zod_1.z.date(),
    data: zod_1.z.record(zod_1.z.any()),
    generatedAt: zod_1.z.date(),
    createdAt: zod_1.z.date()
});
// Create Financial Report Types
exports.CreateFinancialReportSchema = zod_1.z.object({
    type: exports.ReportTypeSchema,
    period: zod_1.z.string(),
    startDate: zod_1.z.date(),
    endDate: zod_1.z.date()
});
//# sourceMappingURL=accounting.js.map