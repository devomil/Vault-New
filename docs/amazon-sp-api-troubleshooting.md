# Amazon SP-API Integration Troubleshooting Guide

## Overview
This guide helps resolve common issues when integrating with Amazon's Selling Partner API (SP-API).

## Common Issues and Solutions

### 1. Timeout Errors (10000ms exceeded)

**Problem**: Frontend requests timing out after 10 seconds.

**Solution**:
```typescript
// Update frontend timeout in frontend/src/services/api.ts
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 60000, // Increase to 60 seconds for SP-API calls
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Also update Vite proxy configuration**:
```typescript
// frontend/vite.config.ts
server: {
  port: 3000,
  proxy: {
    '/api/v1/marketplaces': {
      target: 'http://localhost:3002',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/v1\/marketplaces/, '/api/v1/marketplaces')
    },
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '/api')
    }
  }
}
```

### 2. OAuth 2.0 Authentication Failures

**Problem**: "Client authentication failed" or "invalid_client" errors.

**Solutions**:
1. **Check Credential Expiration**: LWA credentials expire every 180 days
2. **Verify Credential Format**: Ensure client ID and secret are correct
3. **Check Refresh Token**: Ensure refresh token is valid and not expired
4. **Environment Mismatch**: Use sandbox credentials for sandbox environment

**Required Credentials**:
- Client ID: `amzn1.application-oa2-client.xxx`
- Client Secret: `amzn1.oa2-cs.v1.xxx`
- Refresh Token: `Atzr|xxx`
- Marketplace ID: `ATVPDKIKX0DER` (US)
- Seller ID: Your Amazon seller ID

### 3. 403 Access Denied Errors

**Problem**: "Access to requested resource is denied" after successful authentication.

**Solutions**:
1. **Check Application Permissions**: Ensure SP-API application has required scopes
2. **Verify Marketplace Access**: Confirm seller has access to the marketplace
3. **Check Sandbox vs Production**: Use correct environment for credentials
4. **Application Approval**: Ensure application is approved in Seller Central

### 4. Service Connection Issues

**Problem**: Backend services not responding or routing incorrectly.

**Solutions**:
1. **Check Service Ports**:
   ```bash
   # Verify services are running
   Get-NetTCPConnection | Where-Object {$_.LocalPort -eq 3002}
   ```

2. **Start Required Services**:
   ```bash
   # Start marketplace integration service
   cd services/marketplace-integration && npm run dev
   
   # Start frontend
   cd frontend && npm run dev
   ```

3. **Check API Gateway**: Ensure API gateway is running on port 3001

### 5. Frontend Proxy Issues

**Problem**: Frontend can't reach backend services.

**Solution**: Update Vite proxy configuration to route directly to marketplace service:
```typescript
// frontend/vite.config.ts
proxy: {
  '/api/v1/marketplaces': {
    target: 'http://localhost:3002',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/v1\/marketplaces/, '/api/v1/marketplaces')
  }
}
```

## Testing the Integration

### 1. Backend API Test
```bash
# Test SP-API endpoint directly
Invoke-RestMethod -Uri "http://localhost:3002/api/v1/marketplaces/test-sp-api" -Method POST -Headers @{"Content-Type"="application/json"; "x-tenant-id"="test-tenant-123"} -Body '{"clientId":"your-client-id","clientSecret":"your-client-secret","refreshToken":"your-refresh-token","marketplaceId":"ATVPDKIKX0DER","sellerId":"your-seller-id","region":"us-east-1","environment":"production"}'
```

### 2. Frontend Integration Test
1. Navigate to Integration Testing page
2. Select "Amazon Seller Central"
3. Enter your credentials
4. Click "Test Marketplace Connection"
5. Verify success response

## Required Credentials Setup

### 1. Amazon SP-API Application Setup
1. **Create Application**: In Seller Central → Apps and Services → Develop Apps
2. **Generate Credentials**: Get Client ID and Client Secret
3. **Authorize Application**: Generate OAuth authorization URL
4. **Get Refresh Token**: Complete authorization flow
5. **Configure Permissions**: Set required SP-API scopes

### 2. Credential Rotation
- **Frequency**: Every 180 days
- **Process**: Rotate client secret in Seller Central
- **Impact**: Refresh tokens remain valid
- **Timeline**: 7-day grace period after rotation

## Environment Configuration

### Sandbox vs Production
```typescript
// Use sandbox for testing
const credentials = {
  environment: 'sandbox', // or 'production'
  // ... other credentials
};
```

### Regional Endpoints
- **US East**: `us-east-1`
- **US West**: `us-west-2`
- **Europe**: `eu-west-1`, `eu-central-1`
- **Asia Pacific**: `ap-southeast-1`

## Monitoring and Debugging

### 1. Enable Debug Logging
```typescript
// In marketplace integration service
this.logger.info('Amazon SP-API access token refreshed successfully');
this.logger.error('Failed to refresh Amazon SP-API access token', {
  error: error.response?.data || error.message,
  status: error.response?.status,
  statusText: error.response?.statusText
});
```

### 2. Check Service Health
```bash
# Check marketplace integration service
curl http://localhost:3002/health

# Check API gateway
curl http://localhost:3001/api/health
```

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `timeout of 10000ms exceeded` | Frontend timeout too short | Increase timeout to 60000ms |
| `Client authentication failed` | Invalid credentials | Check credential validity and expiration |
| `Access to requested resource is denied` | Missing permissions | Verify SP-API application permissions |
| `Request failed with status code 500` | Backend service error | Check service logs and health |

## Support Resources

- [Amazon SP-API Documentation](https://developer-docs.amazon.com/sp-api/docs)
- [LWA Credential Rotation](https://developer-docs.amazon.com/sp-api/docs/rotating-your-apps-lwa-credentials)
- [SP-API Error Codes](https://developer-docs.amazon.com/sp-api/docs/sp-api-errors-faq)
- [OAuth 2.0 Authorization](https://developer-docs.amazon.com/sp-api/docs/authorization)

---

**Last Updated**: 2025-07-18  
**Version**: 1.0 