# Smoke Tests for Vault Modernization Platform
# Week 16: CI/CD & Integration Testing

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("staging", "production", "local")]
    [string]$Environment = "staging"
)

# Configuration
$BaseUrl = ""
$KubeConfig = ""

# Set environment-specific configuration
switch ($Environment) {
    "staging" {
        $BaseUrl = "https://staging.vault-modernization.com"
        $KubeConfig = "$env:USERPROFILE\.kube\config-staging"
    }
    "production" {
        $BaseUrl = "https://vault-modernization.com"
        $KubeConfig = "$env:USERPROFILE\.kube\config-production"
    }
    "local" {
        $BaseUrl = "http://localhost:3000"
        $KubeConfig = ""
    }
}

Write-Host "🚀 Running smoke tests for $Environment environment" -ForegroundColor Cyan
Write-Host "📍 Base URL: $BaseUrl" -ForegroundColor Cyan

# Test counter
$TestsPassed = 0
$TestsFailed = 0

# Helper function to run a test
function Run-Test {
    param(
        [string]$TestName,
        [scriptblock]$TestCommand
    )
    
    Write-Host "🧪 Running: $TestName... " -NoNewline
    
    try {
        $null = & $TestCommand
        Write-Host "✅ PASS" -ForegroundColor Green
        $script:TestsPassed++
    }
    catch {
        Write-Host "❌ FAIL" -ForegroundColor Red
        $script:TestsFailed++
    }
}

# Helper function to check HTTP response
function Test-HttpResponse {
    param(
        [string]$Url,
        [int]$ExpectedStatus = 200,
        [string]$Method = "GET",
        [string]$Data = ""
    )
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($Method -eq "POST" -and $Data) {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers -Body $Data -StatusCodeVariable statusCode
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -StatusCodeVariable statusCode
        }
        
        return $statusCode -eq $ExpectedStatus
    }
    catch {
        return $false
    }
}

# Helper function to check JSON response
function Test-JsonResponse {
    param(
        [string]$Url,
        [string]$JqFilter,
        [string]$ExpectedValue
    )
    
    try {
        $response = Invoke-RestMethod -Uri $Url
        $result = $response | ConvertTo-Json -Depth 10 | jq -r $JqFilter
        return $result -eq $ExpectedValue
    }
    catch {
        return $false
    }
}

# 1. Health Check
Run-Test "Health Check" { Test-HttpResponse -Url "$BaseUrl/health" }

# 2. API Gateway Status
Run-Test "API Gateway Status" { Test-HttpResponse -Url "$BaseUrl/api/status" }

# 3. Database Connectivity
Run-Test "Database Connectivity" { Test-HttpResponse -Url "$BaseUrl/api/health/db" }

# 4. Redis Connectivity
Run-Test "Redis Connectivity" { Test-HttpResponse -Url "$BaseUrl/api/health/redis" }

# 5. Authentication Service
Run-Test "Authentication Service" { Test-HttpResponse -Url "$BaseUrl/api/auth/status" }

# 6. Product Intelligence Service
Run-Test "Product Intelligence Service" { Test-HttpResponse -Url "$BaseUrl/api/products/status" }

# 7. Marketplace Integration Service
Run-Test "Marketplace Integration Service" { Test-HttpResponse -Url "$BaseUrl/api/marketplace/status" }

# 8. Vendor Integration Service
Run-Test "Vendor Integration Service" { Test-HttpResponse -Url "$BaseUrl/api/vendor/status" }

# 9. Order Processing Service
Run-Test "Order Processing Service" { Test-HttpResponse -Url "$BaseUrl/api/orders/status" }

# 10. Pricing Engine Service
Run-Test "Pricing Engine Service" { Test-HttpResponse -Url "$BaseUrl/api/pricing/status" }

# 11. Inventory Management Service
Run-Test "Inventory Management Service" { Test-HttpResponse -Url "$BaseUrl/api/inventory/status" }

# 12. Analytics Engine Service
Run-Test "Analytics Engine Service" { Test-HttpResponse -Url "$BaseUrl/api/analytics/status" }

# 13. Notification Service
Run-Test "Notification Service" { Test-HttpResponse -Url "$BaseUrl/api/notifications/status" }

# 14. Performance Optimization Service
Run-Test "Performance Optimization Service" { Test-HttpResponse -Url "$BaseUrl/api/performance/status" }

# 15. Security Compliance Service
Run-Test "Security Compliance Service" { Test-HttpResponse -Url "$BaseUrl/api/security/status" }

# 16. Frontend Accessibility
Run-Test "Frontend Accessibility" { Test-HttpResponse -Url "$BaseUrl" }

# 17. Login Page Load
Run-Test "Login Page Load" { Test-HttpResponse -Url "$BaseUrl/login" }

# 18. Dashboard Page Load (should redirect to login)
Run-Test "Dashboard Redirect" { Test-HttpResponse -Url "$BaseUrl/dashboard" -ExpectedStatus 302 }

# 19. API Documentation
Run-Test "API Documentation" { Test-HttpResponse -Url "$BaseUrl/api/docs" }

# 20. Metrics Endpoint
Run-Test "Metrics Endpoint" { Test-HttpResponse -Url "$BaseUrl/metrics" }

# 21. Kubernetes Pod Status (if kubectl available)
if (Get-Command kubectl -ErrorAction SilentlyContinue) {
    if ($KubeConfig -and (Test-Path $KubeConfig)) {
        Run-Test "Kubernetes Pod Status" {
            $env:KUBECONFIG = $KubeConfig
            $pods = kubectl get pods -n "vault-$Environment" --no-headers 2>$null
            $nonRunningPods = $pods | Where-Object { $_ -notmatch "Running|Completed" }
            return $nonRunningPods.Count -eq 0
        }
    }
}

# 22. Service Discovery
Run-Test "Service Discovery" { Test-HttpResponse -Url "$BaseUrl/api/services" }

# 23. Configuration Validation
Run-Test "Configuration Validation" { Test-HttpResponse -Url "$BaseUrl/api/config/validate" }

# 24. Feature Flags
Run-Test "Feature Flags" { Test-HttpResponse -Url "$BaseUrl/api/features" }

# 25. Rate Limiting (should return 429 after multiple requests)
Run-Test "Rate Limiting" {
    $rateLimitHit = $false
    for ($i = 1; $i -le 10; $i++) {
        try {
            $response = Invoke-RestMethod -Uri "$BaseUrl/api/test" -StatusCodeVariable statusCode
            if ($statusCode -eq 429) {
                $rateLimitHit = $true
                break
            }
        }
        catch {
            if ($_.Exception.Response.StatusCode -eq 429) {
                $rateLimitHit = $true
                break
            }
        }
    }
    return $rateLimitHit
}

# 26. CORS Headers
Run-Test "CORS Headers" {
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/api/status" -Method Head
        return $response.Headers["Access-Control-Allow-Origin"] -ne $null
    }
    catch {
        return $false
    }
}

# 27. Security Headers
Run-Test "Security Headers" {
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl" -Method Head
        return $response.Headers["X-Content-Type-Options"] -eq "nosniff"
    }
    catch {
        return $false
    }
}

# 28. SSL/TLS (for production/staging)
if ($Environment -ne "local") {
    Run-Test "SSL/TLS Certificate" {
        try {
            $hostname = ($BaseUrl -replace "https://", "").Split(":")[0]
            $tcpClient = New-Object System.Net.Sockets.TcpClient($hostname, 443)
            $sslStream = New-Object System.Net.Security.SslStream($tcpClient.GetStream())
            $sslStream.AuthenticateAsClient($hostname)
            $cert = $sslStream.RemoteCertificate
            $tcpClient.Close()
            return $cert -ne $null
        }
        catch {
            return $false
        }
    }
}

# 29. Database Migration Status
Run-Test "Database Migration Status" { Test-HttpResponse -Url "$BaseUrl/api/health/migrations" }

# 30. Backup Status
Run-Test "Backup Status" { Test-HttpResponse -Url "$BaseUrl/api/health/backup" }

Write-Host ""
Write-Host "📊 Smoke Test Results:" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host "✅ Tests Passed: $TestsPassed" -ForegroundColor Green
Write-Host "❌ Tests Failed: $TestsFailed" -ForegroundColor Red
Write-Host ""

# Calculate success rate
$TotalTests = $TestsPassed + $TestsFailed
if ($TotalTests -gt 0) {
    $SuccessRate = [math]::Round(($TestsPassed * 100) / $TotalTests)
    Write-Host "📈 Success Rate: $SuccessRate%" -ForegroundColor Cyan
    
    if ($SuccessRate -ge 90) {
        Write-Host "🎉 Smoke tests passed! Deployment is healthy." -ForegroundColor Green
        exit 0
    }
    elseif ($SuccessRate -ge 80) {
        Write-Host "⚠️  Smoke tests mostly passed. Some issues detected." -ForegroundColor Yellow
        exit 1
    }
    else {
        Write-Host "🚨 Smoke tests failed! Deployment has issues." -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "🚨 No tests were executed!" -ForegroundColor Red
    exit 1
} 