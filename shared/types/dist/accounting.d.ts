import { z } from 'zod';
export declare const AccountTypeSchema: z.ZodEnum<["asset", "liability", "equity", "revenue", "expense"]>;
export type AccountType = z.infer<typeof AccountTypeSchema>;
export declare const AccountStatusSchema: z.ZodEnum<["active", "inactive", "archived"]>;
export type AccountStatus = z.infer<typeof AccountStatusSchema>;
export declare const AccountSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    accountNumber: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<["asset", "liability", "equity", "revenue", "expense"]>;
    status: z.ZodDefault<z.ZodEnum<["active", "inactive", "archived"]>>;
    balance: z.ZodDefault<z.ZodNumber>;
    currency: z.ZodDefault<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    parentAccountId: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    tenantId: string;
    accountNumber: string;
    name: string;
    type: "asset" | "liability" | "equity" | "revenue" | "expense";
    status: "active" | "inactive" | "archived";
    balance: number;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
    description?: string | undefined;
    parentAccountId?: string | undefined;
}, {
    id: string;
    tenantId: string;
    accountNumber: string;
    name: string;
    type: "asset" | "liability" | "equity" | "revenue" | "expense";
    createdAt: Date;
    updatedAt: Date;
    status?: "active" | "inactive" | "archived" | undefined;
    balance?: number | undefined;
    currency?: string | undefined;
    description?: string | undefined;
    parentAccountId?: string | undefined;
}>;
export declare const CreateAccountSchema: z.ZodObject<{
    accountNumber: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<["asset", "liability", "equity", "revenue", "expense"]>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "archived"]>>;
    balance: z.ZodDefault<z.ZodNumber>;
    currency: z.ZodDefault<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    parentAccountId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    accountNumber: string;
    name: string;
    type: "asset" | "liability" | "equity" | "revenue" | "expense";
    balance: number;
    currency: string;
    status?: "active" | "inactive" | "archived" | undefined;
    description?: string | undefined;
    parentAccountId?: string | undefined;
}, {
    accountNumber: string;
    name: string;
    type: "asset" | "liability" | "equity" | "revenue" | "expense";
    status?: "active" | "inactive" | "archived" | undefined;
    balance?: number | undefined;
    currency?: string | undefined;
    description?: string | undefined;
    parentAccountId?: string | undefined;
}>;
export declare const UpdateAccountSchema: z.ZodObject<{
    accountNumber: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["asset", "liability", "equity", "revenue", "expense"]>>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "archived"]>>;
    balance: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    parentAccountId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    accountNumber?: string | undefined;
    name?: string | undefined;
    type?: "asset" | "liability" | "equity" | "revenue" | "expense" | undefined;
    status?: "active" | "inactive" | "archived" | undefined;
    balance?: number | undefined;
    currency?: string | undefined;
    description?: string | undefined;
    parentAccountId?: string | undefined;
}, {
    accountNumber?: string | undefined;
    name?: string | undefined;
    type?: "asset" | "liability" | "equity" | "revenue" | "expense" | undefined;
    status?: "active" | "inactive" | "archived" | undefined;
    balance?: number | undefined;
    currency?: string | undefined;
    description?: string | undefined;
    parentAccountId?: string | undefined;
}>;
export declare const TransactionTypeSchema: z.ZodEnum<["sale", "purchase", "payment", "refund", "adjustment", "transfer", "expense", "income"]>;
export type TransactionType = z.infer<typeof TransactionTypeSchema>;
export declare const TransactionStatusSchema: z.ZodEnum<["pending", "posted", "cancelled", "reversed"]>;
export type TransactionStatus = z.infer<typeof TransactionStatusSchema>;
export declare const TransactionSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    transactionNumber: z.ZodString;
    type: z.ZodEnum<["sale", "purchase", "payment", "refund", "adjustment", "transfer", "expense", "income"]>;
    status: z.ZodDefault<z.ZodEnum<["pending", "posted", "cancelled", "reversed"]>>;
    date: z.ZodDate;
    amount: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    reference: z.ZodOptional<z.ZodString>;
    entries: z.ZodArray<z.ZodObject<{
        accountId: z.ZodString;
        debit: z.ZodDefault<z.ZodNumber>;
        credit: z.ZodDefault<z.ZodNumber>;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        accountId: string;
        debit: number;
        credit: number;
        description?: string | undefined;
    }, {
        accountId: string;
        description?: string | undefined;
        debit?: number | undefined;
        credit?: number | undefined;
    }>, "many">;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    tenantId: string;
    type: "expense" | "sale" | "purchase" | "payment" | "refund" | "adjustment" | "transfer" | "income";
    status: "pending" | "posted" | "cancelled" | "reversed";
    currency: string;
    createdAt: Date;
    updatedAt: Date;
    entries: {
        accountId: string;
        debit: number;
        credit: number;
        description?: string | undefined;
    }[];
    transactionNumber: string;
    date: Date;
    amount: number;
    description?: string | undefined;
    reference?: string | undefined;
}, {
    id: string;
    tenantId: string;
    type: "expense" | "sale" | "purchase" | "payment" | "refund" | "adjustment" | "transfer" | "income";
    createdAt: Date;
    updatedAt: Date;
    entries: {
        accountId: string;
        description?: string | undefined;
        debit?: number | undefined;
        credit?: number | undefined;
    }[];
    transactionNumber: string;
    date: Date;
    amount: number;
    status?: "pending" | "posted" | "cancelled" | "reversed" | undefined;
    currency?: string | undefined;
    description?: string | undefined;
    reference?: string | undefined;
}>;
export declare const CreateTransactionEntrySchema: z.ZodObject<{
    accountId: z.ZodString;
    debit: z.ZodDefault<z.ZodNumber>;
    credit: z.ZodDefault<z.ZodNumber>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    accountId: string;
    debit: number;
    credit: number;
    description?: string | undefined;
}, {
    accountId: string;
    description?: string | undefined;
    debit?: number | undefined;
    credit?: number | undefined;
}>;
export declare const CreateTransactionSchema: z.ZodObject<{
    type: z.ZodEnum<["sale", "purchase", "payment", "refund", "adjustment", "transfer", "expense", "income"]>;
    status: z.ZodOptional<z.ZodEnum<["pending", "posted", "cancelled", "reversed"]>>;
    date: z.ZodDate;
    amount: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    reference: z.ZodOptional<z.ZodString>;
    entries: z.ZodArray<z.ZodObject<{
        accountId: z.ZodString;
        debit: z.ZodDefault<z.ZodNumber>;
        credit: z.ZodDefault<z.ZodNumber>;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        accountId: string;
        debit: number;
        credit: number;
        description?: string | undefined;
    }, {
        accountId: string;
        description?: string | undefined;
        debit?: number | undefined;
        credit?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    type: "expense" | "sale" | "purchase" | "payment" | "refund" | "adjustment" | "transfer" | "income";
    currency: string;
    entries: {
        accountId: string;
        debit: number;
        credit: number;
        description?: string | undefined;
    }[];
    date: Date;
    amount: number;
    status?: "pending" | "posted" | "cancelled" | "reversed" | undefined;
    description?: string | undefined;
    reference?: string | undefined;
}, {
    type: "expense" | "sale" | "purchase" | "payment" | "refund" | "adjustment" | "transfer" | "income";
    entries: {
        accountId: string;
        description?: string | undefined;
        debit?: number | undefined;
        credit?: number | undefined;
    }[];
    date: Date;
    amount: number;
    status?: "pending" | "posted" | "cancelled" | "reversed" | undefined;
    currency?: string | undefined;
    description?: string | undefined;
    reference?: string | undefined;
}>;
export declare const UpdateTransactionSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<["sale", "purchase", "payment", "refund", "adjustment", "transfer", "expense", "income"]>>;
    status: z.ZodOptional<z.ZodEnum<["pending", "posted", "cancelled", "reversed"]>>;
    date: z.ZodOptional<z.ZodDate>;
    amount: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    reference: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type?: "expense" | "sale" | "purchase" | "payment" | "refund" | "adjustment" | "transfer" | "income" | undefined;
    status?: "pending" | "posted" | "cancelled" | "reversed" | undefined;
    currency?: string | undefined;
    description?: string | undefined;
    date?: Date | undefined;
    amount?: number | undefined;
    reference?: string | undefined;
}, {
    type?: "expense" | "sale" | "purchase" | "payment" | "refund" | "adjustment" | "transfer" | "income" | undefined;
    status?: "pending" | "posted" | "cancelled" | "reversed" | undefined;
    currency?: string | undefined;
    description?: string | undefined;
    date?: Date | undefined;
    amount?: number | undefined;
    reference?: string | undefined;
}>;
export declare const ReportTypeSchema: z.ZodEnum<["balance_sheet", "income_statement", "cash_flow", "trial_balance", "general_ledger"]>;
export type ReportType = z.infer<typeof ReportTypeSchema>;
export declare const FinancialReportSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    type: z.ZodEnum<["balance_sheet", "income_statement", "cash_flow", "trial_balance", "general_ledger"]>;
    period: z.ZodString;
    startDate: z.ZodDate;
    endDate: z.ZodDate;
    data: z.ZodRecord<z.ZodString, z.ZodAny>;
    generatedAt: z.ZodDate;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    tenantId: string;
    type: "balance_sheet" | "income_statement" | "cash_flow" | "trial_balance" | "general_ledger";
    createdAt: Date;
    period: string;
    startDate: Date;
    endDate: Date;
    data: Record<string, any>;
    generatedAt: Date;
}, {
    id: string;
    tenantId: string;
    type: "balance_sheet" | "income_statement" | "cash_flow" | "trial_balance" | "general_ledger";
    createdAt: Date;
    period: string;
    startDate: Date;
    endDate: Date;
    data: Record<string, any>;
    generatedAt: Date;
}>;
export declare const CreateFinancialReportSchema: z.ZodObject<{
    type: z.ZodEnum<["balance_sheet", "income_statement", "cash_flow", "trial_balance", "general_ledger"]>;
    period: z.ZodString;
    startDate: z.ZodDate;
    endDate: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    type: "balance_sheet" | "income_statement" | "cash_flow" | "trial_balance" | "general_ledger";
    period: string;
    startDate: Date;
    endDate: Date;
}, {
    type: "balance_sheet" | "income_statement" | "cash_flow" | "trial_balance" | "general_ledger";
    period: string;
    startDate: Date;
    endDate: Date;
}>;
export type Account = z.infer<typeof AccountSchema>;
export type CreateAccount = z.infer<typeof CreateAccountSchema>;
export type UpdateAccount = z.infer<typeof UpdateAccountSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type CreateTransaction = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransaction = z.infer<typeof UpdateTransactionSchema>;
export type CreateTransactionEntry = z.infer<typeof CreateTransactionEntrySchema>;
export type FinancialReport = z.infer<typeof FinancialReportSchema>;
export type CreateFinancialReport = z.infer<typeof CreateFinancialReportSchema>;
//# sourceMappingURL=accounting.d.ts.map