"use strict";
// Amazon Seller Central API Types
// Based on Amazon Selling Partner API and MWS API specifications
Object.defineProperty(exports, "__esModule", { value: true });
exports.AMAZON_REPORT_TYPES = exports.AMAZON_MARKETPLACE_IDS = exports.AMAZON_API_ENDPOINTS = void 0;
// API Endpoints
exports.AMAZON_API_ENDPOINTS = {
    'us-east-1': {
        mws: 'https://mws.amazonservices.com',
        spApi: 'https://sellingpartnerapi-na.amazon.com'
    },
    'us-west-2': {
        mws: 'https://mws.amazonservices.com',
        spApi: 'https://sellingpartnerapi-na.amazon.com'
    },
    'eu-west-1': {
        mws: 'https://mws-eu.amazonservices.com',
        spApi: 'https://sellingpartnerapi-eu.amazon.com'
    },
    'eu-central-1': {
        mws: 'https://mws-eu.amazonservices.com',
        spApi: 'https://sellingpartnerapi-eu.amazon.com'
    },
    'ap-southeast-1': {
        mws: 'https://mws.amazonservices.com',
        spApi: 'https://sellingpartnerapi-fe.amazon.com'
    }
};
// Marketplace IDs
exports.AMAZON_MARKETPLACE_IDS = {
    'US': 'ATVPDKIKX0DER',
    'CA': 'A2EUQ1WTGCTBG2',
    'MX': 'A1AM78C64UM0Y8',
    'BR': 'A2Q3Y263D00KWC',
    'ES': 'A1RKKUPIHCS9HS',
    'UK': 'A1F83G8C2ARO7P',
    'FR': 'A13V1IB3VIYZZH',
    'DE': 'A1PA6795UKMFR9',
    'IT': 'APJ6JRA9NG5V4',
    'JP': 'A1VC38T7YXB528',
    'AU': 'A39IBJ37TRP1C6',
    'IN': 'A21TJRUUN4KGV'
};
// Report Types
exports.AMAZON_REPORT_TYPES = {
    // Inventory Reports
    'GET_FLAT_FILE_OPEN_LISTINGS_DATA': 'Open Listings Report',
    'GET_MERCHANT_LISTINGS_DATA': 'Active Listings Report',
    'GET_MERCHANT_LISTINGS_INACTIVE_DATA': 'Inactive Listings Report',
    // Order Reports
    'GET_FLAT_FILE_ORDERS_DATA_BY_ORDER_DATE_GENERAL': 'Orders Report',
    'GET_FLAT_FILE_ORDERS_DATA_BY_LAST_UPDATE_GENERAL': 'Orders Report by Last Update',
    // Financial Reports
    'GET_FLAT_FILE_ACTIONABLE_ORDER_DATA_SHIPPING': 'Shipping Actionable Order Report',
    // Performance Reports
    'GET_SELLER_FEEDBACK_DATA': 'Seller Feedback Report',
    'GET_V1_SELLER_PERFORMANCE_REPORT': 'Seller Performance Report'
};
//# sourceMappingURL=amazon-api.js.map