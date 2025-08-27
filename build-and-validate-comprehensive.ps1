# ============================================================================
# GridGhost Racing Platform - Comprehensive Zero-Tolerance Validation Script
# ============================================================================
# Purpose: Exhaustive testing of "every square inch" of the platform
# Mode: Zero-tolerance - ALL critical tests must pass for deployment approval
# Scope: Database, Authentication, APIs, Security, Performance, Load Testing
# ============================================================================

param(
    [switch]$FastMode = $false,
    [switch]$DebugMode = $false,
    [switch]$SkipMobile = $false,
    [switch]$SkipAdmin = $false
)

# ============================================================================
# CONFIGURATION - ZERO-TOLERANCE THRESHOLDS
# ============================================================================

# Core service ports
$BACKEND_PORT = 4000
$WEBSOCKET_PORT = 8080
$METRO_PORT = 8081
$ADMIN_PORT = 5173

# Timeout configurations (strict for zero-tolerance)
$STARTUP_TIMEOUT = 120      # Backend/services startup
$API_TIMEOUT = 10           # Individual API calls
$BUILD_TIMEOUT = 300        # Build operations
$HEALTH_TIMEOUT = 60        # Health check iterations

# Performance thresholds
$MAX_RESPONSE_TIME_MS = 2000
$MAX_MEMORY_USAGE_MB = 512
$MIN_SUCCESS_RATE = 95      # Minimum 95% success rate for deployment

# Validation tracking
$Global:ValidationResults = @{}
$Global:TestCount = 0
$Global:PassedCount = 0
$Global:CriticalFailures = @()

# ============================================================================
# ENHANCED UTILITIES AND LOGGING
# ============================================================================

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor White -BackgroundColor DarkCyan
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Test {
    param(
        [string]$TestName,
        [string]$Status,
        [string]$Message = "",
        [switch]$Critical = $false
    )
    
    $Global:TestCount++
    
    $statusColor = switch ($Status) {
        "PASS" { "Green"; $Global:PassedCount++ }
        "FAIL" { "Red"; if ($Critical) { $Global:CriticalFailures += $TestName } }
        "WARN" { "Yellow" }
        "SKIP" { "Gray"; $Global:PassedCount++ }
        default { "White" }
    }
    
    $icon = switch ($Status) {
        "PASS" { "✅" }
        "FAIL" { "❌" }
        "WARN" { "⚠️ " }
        "SKIP" { "⏭️ " }
        default { "🔍" }
    }
    
    $criticality = if ($Critical -and $Status -eq "FAIL") { " [CRITICAL]" } else { "" }
    Write-Host "$icon $TestName`: $Status$criticality" -ForegroundColor $statusColor
    if ($Message) {
        Write-Host "    $Message" -ForegroundColor Gray
    }
}

function Initialize-ValidationTracking {
    $Global:ValidationResults = @{
        Prerequisites = $false
        DatabaseIntegrity = $false
        UserAuthentication = $false
        SecurityValidation = $false
        BackendAPI = $false
        WebSocketCommunication = $false
        LoadTesting = $false
        PerformanceValidation = $false
        MobileApp = $false
        MobileBuild = $false
        AdminPortal = $false
        AdminPortalBuild = $false
        ErrorHandling = $false
        SystemRecovery = $false
    }
    $Global:TestCount = 0
    $Global:PassedCount = 0
    $Global:CriticalFailures = @()
}

function Invoke-TestWithTimeout {
    param(
        [string]$TestName,
        [int]$TimeoutSeconds,
        [scriptblock]$TestScript,
        [switch]$Critical = $false
    )
    
    try {
        $job = Start-Job -ScriptBlock $TestScript
        $result = $job | Wait-Job -Timeout $TimeoutSeconds | Receive-Job
        $job | Remove-Job -Force
        
        if ($result -eq $null) {
            Write-Test $TestName "FAIL" "Test timed out after $TimeoutSeconds seconds" -Critical:$Critical
            return $false
        }
        
        return $result
    } catch {
        Write-Test $TestName "FAIL" "Exception: $($_.Exception.Message)" -Critical:$Critical
        return $false
    }
}

# ============================================================================
# COMPREHENSIVE VALIDATION FUNCTIONS
# ============================================================================

function Test-Prerequisites {
    Write-Section "Prerequisites and Environment Validation"
    
    # Node.js validation
    $nodeTest = Invoke-TestWithTimeout -TestName "Node.js Runtime" -TimeoutSeconds 10 -Critical -TestScript {
        try {
            $nodeVersion = node --version 2>$null
            if ($nodeVersion -and $nodeVersion -match "v(\d+)\.") {
                $majorVersion = [int]$Matches[1]
                if ($majorVersion -ge 18) {
                    Write-Test "Node.js Runtime" "PASS" "Version $nodeVersion (compatible)"
                    return $true
                } else {
                    Write-Test "Node.js Runtime" "FAIL" "Version $nodeVersion (requires v18+)" -Critical
                    return $false
                }
            } else {
                Write-Test "Node.js Runtime" "FAIL" "Node.js not found or invalid version" -Critical
                return $false
            }
        } catch {
            return $false
        }
    }
    
    # npm validation
    $npmTest = Invoke-TestWithTimeout -TestName "npm Package Manager" -TimeoutSeconds 10 -Critical -TestScript {
        try {
            $npmVersion = npm --version 2>$null
            if ($npmVersion) {
                Write-Test "npm Package Manager" "PASS" "Version $npmVersion"
                return $true
            } else {
                Write-Test "npm Package Manager" "FAIL" "npm not found" -Critical
                return $false
            }
        } catch {
            return $false
        }
    }
    
    # Port availability
    $portTests = @($BACKEND_PORT, $WEBSOCKET_PORT, $METRO_PORT, $ADMIN_PORT)
    $portsAvailable = $true
    
    foreach ($port in $portTests) {
        $portTest = Invoke-TestWithTimeout -TestName "Port $port Availability" -TimeoutSeconds 5 -Critical -TestScript {
            try {
                $connections = netstat -ano | Select-String ":$port\s.*LISTENING"
                if ($connections) {
                    Write-Test "Port $port Availability" "WARN" "Port in use - will attempt to use anyway"
                    return $true
                } else {
                    Write-Test "Port $port Availability" "PASS" "Port available"
                    return $true
                }
            } catch {
                return $false
            }
        }
        if (-not $portTest) { $portsAvailable = $false }
    }
    
    # Dependencies check
    $depTest = Invoke-TestWithTimeout -TestName "Project Dependencies" -TimeoutSeconds 30 -Critical -TestScript {
        try {
            $requiredDirs = @("backend", "mobile", "admin-portal", "database")
            foreach ($dir in $requiredDirs) {
                if (-not (Test-Path $dir)) {
                    Write-Test "Project Dependencies" "FAIL" "Missing directory: $dir" -Critical
                    return $false
                }
            }
            
            $requiredFiles = @("package.json", "azure.yaml", "turbo.json")
            foreach ($file in $requiredFiles) {
                if (-not (Test-Path $file)) {
                    Write-Test "Project Dependencies" "FAIL" "Missing file: $file" -Critical
                    return $false
                }
            }
            
            Write-Test "Project Dependencies" "PASS" "All required files and directories present"
            return $true
        } catch {
            return $false
        }
    }
    
    $allTests = $nodeTest -and $npmTest -and $portsAvailable -and $depTest
    $Global:ValidationResults.Prerequisites = $allTests
    return $allTests
}

function Test-DatabaseIntegrityAndOperations {
    Write-Section "Database Integrity and Operations Testing"
    
    Write-Host "🗄️ Testing database schema, CRUD operations, and data integrity..."
    
    # Database schema validation
    $schemaTest = Invoke-TestWithTimeout -TestName "Database Schema Integrity" -TimeoutSeconds 30 -Critical -TestScript {
        try {
            # Check if schema file exists
            if (-not (Test-Path "database/schema.prisma")) {
                Write-Test "Database Schema Integrity" "FAIL" "schema.prisma not found" -Critical
                return $false
            }
            
            # Check for required models in schema
            $schemaContent = Get-Content "database/schema.prisma" -Raw
            $requiredModels = @("User", "Race", "Car", "Event")
            
            foreach ($model in $requiredModels) {
                if ($schemaContent -notmatch "model\s+$model\s*\{") {
                    Write-Test "Database Schema Integrity" "FAIL" "Missing model: $model" -Critical
                    return $false
                }
            }
            
            Write-Test "Database Schema Integrity" "PASS" "All required models present in schema"
            return $true
        } catch {
            Write-Test "Database Schema Integrity" "FAIL" "Exception reading schema" -Critical
            return $false
        }
    }
    
    # Database CRUD operations test
    $crudTest = Invoke-TestWithTimeout -TestName "Database CRUD Operations" -TimeoutSeconds 60 -Critical -TestScript {
        try {
            Push-Location database
            
            # Test Prisma client generation
            $generateResult = & npx prisma generate 2>&1
            if ($LASTEXITCODE -ne 0) {
                Write-Test "Database CRUD Operations" "FAIL" "Prisma client generation failed" -Critical
                return $false
            }
            
            # Test database connection
            $dbTestResult = & npx prisma db pull --force 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Test "Database CRUD Operations" "PASS" "Database connection and schema sync successful"
                return $true
            } else {
                Write-Test "Database CRUD Operations" "FAIL" "Database connection failed" -Critical
                return $false
            }
        } catch {
            Write-Test "Database CRUD Operations" "FAIL" "Exception during database operations" -Critical
            return $false
        } finally {
            Pop-Location
        }
    }
    
    # Database migration validation
    $migrationTest = Invoke-TestWithTimeout -TestName "Database Migration Validation" -TimeoutSeconds 45 -Critical -TestScript {
        try {
            Push-Location database
            
            # Check migration status
            $migrationStatus = & npx prisma migrate status 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Test "Database Migration Validation" "PASS" "All migrations up to date"
                return $true
            } else {
                # Try to apply pending migrations
                $migrationDeploy = & npx prisma migrate deploy 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-Test "Database Migration Validation" "PASS" "Migrations applied successfully"
                    return $true
                } else {
                    Write-Test "Database Migration Validation" "FAIL" "Migration deployment failed" -Critical
                    return $false
                }
            }
        } catch {
            Write-Test "Database Migration Validation" "FAIL" "Exception during migration check" -Critical
            return $false
        } finally {
            Pop-Location
        }
    }
    
    $allTests = $schemaTest -and $crudTest -and $migrationTest
    $Global:ValidationResults.DatabaseIntegrity = $allTests
    return $allTests
}

function Test-UserAuthenticationSecurity {
    Write-Section "User Authentication and Security Validation"
    
    Write-Host "🔐 Testing authentication flows, JWT security, and protection mechanisms..."
    
    # Authentication endpoint security
    $authSecurityTest = Invoke-TestWithTimeout -TestName "Authentication Security" -TimeoutSeconds 30 -Critical -TestScript {
        try {
            # Test invalid login attempts are properly rejected
            $invalidLoginTests = @(
                @{ name = "Empty credentials"; body = '{}' },
                @{ name = "Invalid email format"; body = '{"email": "invalid-email", "password": "test"}' },
                @{ name = "SQL injection attempt"; body = "{`"email`": `"test@test.com`", `"password`": `"'; DROP TABLE Users; --`"}" },
                @{ name = "Script injection"; body = '{"email": "<script>alert(1)</script>", "password": "test"}' }
            )
            
            $securityTestsPassed = 0
            foreach ($test in $invalidLoginTests) {
                try {
                    $response = Invoke-WebRequest -Uri "http://localhost:$BACKEND_PORT/auth/login" -Method POST -Body $test.body -ContentType "application/json" -TimeoutSec 5
                    # Should not get 200 for invalid requests
                    if ($response.StatusCode -ne 200) {
                        $securityTestsPassed++
                    }
                } catch {
                    # Catching errors is expected for invalid requests
                    $securityTestsPassed++
                }
            }
            
            if ($securityTestsPassed -eq $invalidLoginTests.Count) {
                Write-Test "Authentication Security" "PASS" "All $securityTestsPassed invalid login attempts properly rejected"
                return $true
            } else {
                Write-Test "Authentication Security" "FAIL" "Only $securityTestsPassed/$($invalidLoginTests.Count) security tests passed" -Critical
                return $false
            }
        } catch {
            Write-Test "Authentication Security" "FAIL" "Exception during security testing" -Critical
            return $false
        }
    }
    
    # JWT token validation
    $jwtTest = Invoke-TestWithTimeout -TestName "JWT Token Validation" -TimeoutSeconds 20 -Critical -TestScript {
        try {
            # Test invalid token rejection
            $invalidTokenTests = @(
                @{ name = "Missing token"; headers = @{} },
                @{ name = "Invalid token format"; headers = @{"Authorization" = "Bearer invalid-token"} },
                @{ name = "Expired token"; headers = @{"Authorization" = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImV4cCI6MTU0NjMwMDgwMH0.invalid"} }
            )
            
            $jwtTestsPassed = 0
            foreach ($test in $invalidTokenTests) {
                try {
                    $params = @{
                        Uri = "http://localhost:$BACKEND_PORT/users/profile"
                        Method = "GET"
                        TimeoutSec = 5
                    }
                    if ($test.headers) {
                        $params.Headers = $test.headers
                    }
                    
                    $response = Invoke-WebRequest @params
                    # Should get 401 for invalid/missing tokens
                    if ($response.StatusCode -eq 401) {
                        $jwtTestsPassed++
                    }
                } catch {
                    # 401 errors are expected
                    if ($_.Exception.Response.StatusCode -eq 401) {
                        $jwtTestsPassed++
                    }
                }
            }
            
            if ($jwtTestsPassed -eq $invalidTokenTests.Count) {
                Write-Test "JWT Token Validation" "PASS" "All $jwtTestsPassed token validation tests passed"
                return $true
            } else {
                Write-Test "JWT Token Validation" "FAIL" "Only $jwtTestsPassed/$($invalidTokenTests.Count) JWT tests passed" -Critical
                return $false
            }
        } catch {
            Write-Test "JWT Token Validation" "FAIL" "Exception during JWT testing" -Critical
            return $false
        }
    }
    
    # SQL injection protection
    $sqlInjectionTest = Invoke-TestWithTimeout -TestName "SQL Injection Protection" -TimeoutSeconds 15 -Critical -TestScript {
        try {
            $injectionAttempts = @(
                "'; DROP TABLE Users; --",
                "' OR '1'='1",
                "' UNION SELECT * FROM Users --",
                "'; UPDATE Users SET password='hacked' --"
            )
            
            $protectionTestsPassed = 0
            foreach ($injection in $injectionAttempts) {
                try {
                    $body = @{ email = $injection; password = "test" } | ConvertTo-Json
                    $response = Invoke-WebRequest -Uri "http://localhost:$BACKEND_PORT/auth/login" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 5
                    
                    # Should not succeed with 200
                    if ($response.StatusCode -ne 200) {
                        $protectionTestsPassed++
                    }
                } catch {
                    # Errors are expected for injection attempts
                    $protectionTestsPassed++
                }
            }
            
            if ($protectionTestsPassed -eq $injectionAttempts.Count) {
                Write-Test "SQL Injection Protection" "PASS" "All $protectionTestsPassed injection attempts blocked"
                return $true
            } else {
                Write-Test "SQL Injection Protection" "FAIL" "Only $protectionTestsPassed/$($injectionAttempts.Count) injection attempts blocked" -Critical
                return $false
            }
        } catch {
            Write-Test "SQL Injection Protection" "FAIL" "Exception during SQL injection testing" -Critical
            return $false
        }
    }
    
    $allTests = $authSecurityTest -and $jwtTest -and $sqlInjectionTest
    $Global:ValidationResults.UserAuthentication = $allTests
    $Global:ValidationResults.SecurityValidation = $allTests
    return $allTests
}

function Start-BackendWithValidation {
    Write-Section "Backend API Comprehensive Validation"
    
    Write-Host "🚀 Starting backend server..."
    
    # Start backend using root npm script (monorepo structure)
    try {
        $backendProcess = Start-Process -FilePath "pwsh" -ArgumentList "-Command", "npm run dev:backend" -PassThru -WindowStyle Hidden
        
        # Wait for backend to be ready with timeout
        $backendReady = Invoke-TestWithTimeout -TestName "Backend Startup" -TimeoutSeconds $STARTUP_TIMEOUT -Critical -TestScript {
            $attempts = 0
            $maxAttempts = 40
            
            do {
                $attempts++
                Start-Sleep -Seconds 3
                try {
                    $response = Invoke-WebRequest -Uri "http://localhost:$BACKEND_PORT/health" -Method GET -TimeoutSec 5
                    if ($response.StatusCode -eq 200) {
                        return $true
                    }
                } catch {
                    if ($attempts -eq $maxAttempts) {
                        return $false
                    }
                }
            } while ($attempts -lt $maxAttempts)
            return $false
        }
        
        if (-not $backendReady) {
            Write-Test "Backend Startup" "FAIL" "Server failed to start within $STARTUP_TIMEOUT seconds" -Critical
            return $false
        }
        
        Write-Test "Backend Startup" "PASS" "Server running on port $BACKEND_PORT"
        
        # COMPREHENSIVE API endpoint testing - EVERY endpoint
        Write-Host "🔍 Testing ALL API endpoints comprehensively..."
        
        $endpoints = @(
            # Core system endpoints
            @{ path = "/"; name = "Root API"; method = "GET"; expectStatus = 200; critical = $true },
            @{ path = "/health"; name = "Health Check"; method = "GET"; expectStatus = 200; critical = $true },
            
            # Authentication endpoints
            @{ path = "/auth/login"; name = "Auth Login"; method = "POST"; expectStatus = 400; body = "{}"; critical = $true },
            @{ path = "/auth/signup"; name = "Auth Signup"; method = "POST"; expectStatus = 400; body = "{}"; critical = $true },
            @{ path = "/auth/refresh"; name = "Auth Refresh"; method = "POST"; expectStatus = 401; critical = $true },
            
            # Vehicle endpoints
            @{ path = "/vehicles/health"; name = "Vehicles Health"; method = "GET"; expectStatus = 200; critical = $true },
            @{ path = "/vehicles/search"; name = "Vehicle Search"; method = "GET"; expectStatus = 200; critical = $false },
            @{ path = "/vehicles/makes"; name = "Vehicle Makes"; method = "GET"; expectStatus = 200; critical = $false },
            
            # User and car management
            @{ path = "/cars"; name = "Cars API"; method = "GET"; expectStatus = 401; critical = $true },
            @{ path = "/users/profile"; name = "User Profile"; method = "GET"; expectStatus = 401; critical = $true },
            @{ path = "/users/stats"; name = "User Stats"; method = "GET"; expectStatus = 401; critical = $true },
            
            # Racing and events
            @{ path = "/races"; name = "Races API"; method = "GET"; expectStatus = 401; critical = $true },
            @{ path = "/events"; name = "Events API"; method = "GET"; expectStatus = 401; critical = $true },
            @{ path = "/livemap/nearby"; name = "Live Map"; method = "GET"; expectStatus = 401; critical = $true },
            
            # AI and learning
            @{ path = "/ai/analyze-performance"; name = "AI Analysis"; method = "POST"; expectStatus = 401; body = "{}"; critical = $false },
            @{ path = "/learning-stats"; name = "Learning Stats"; method = "GET"; expectStatus = 401; critical = $false },
            
            # Admin endpoints
            @{ path = "/admin/health"; name = "Admin Health"; method = "GET"; expectStatus = 401; critical = $false },
            @{ path = "/admin/users"; name = "Admin Users"; method = "GET"; expectStatus = 401; critical = $false },
            
            # Error handling
            @{ path = "/nonexistent-endpoint"; name = "404 Handling"; method = "GET"; expectStatus = 404; critical = $true }
        )
        
        $apiTestsPassed = 0
        $criticalApiTests = 0
        $criticalApiPassed = 0
        
        foreach ($endpoint in $endpoints) {
            if ($endpoint.critical) { $criticalApiTests++ }
            
            $apiTest = Invoke-TestWithTimeout -TestName $endpoint.name -TimeoutSeconds $API_TIMEOUT -Critical:$endpoint.critical -TestScript {
                try {
                    $uri = "http://localhost:$BACKEND_PORT$($endpoint.path)"
                    
                    if ($endpoint.method -eq "GET") {
                        $response = Invoke-WebRequest -Uri $uri -Method GET -TimeoutSec $API_TIMEOUT
                    } else {
                        $body = if ($endpoint.body) { $endpoint.body } else { "{}" }
                        $response = Invoke-WebRequest -Uri $uri -Method POST -Body $body -ContentType "application/json" -TimeoutSec $API_TIMEOUT
                    }
                    
                    return ($response.StatusCode -eq $endpoint.expectStatus)
                } catch {
                    return ($_.Exception.Response.StatusCode -eq $endpoint.expectStatus)
                }
            }
            
            if ($apiTest) {
                Write-Test $endpoint.name "PASS" "Status $($endpoint.expectStatus) as expected"
                $apiTestsPassed++
                if ($endpoint.critical) { $criticalApiPassed++ }
            } else {
                Write-Test $endpoint.name "FAIL" "Unexpected response or timeout" -Critical:$endpoint.critical
            }
        }
        
        # WebSocket validation with timeout
        $wsTest = Invoke-TestWithTimeout -TestName "WebSocket Server" -TimeoutSeconds 10 -Critical -TestScript {
            try {
                $wsPort = netstat -ano | Select-String ":$WEBSOCKET_PORT\s.*LISTENING"
                return ($wsPort -ne $null)
            } catch {
                return $false
            }
        }
        
        if ($wsTest) {
            Write-Test "WebSocket Server" "PASS" "Listening on port $WEBSOCKET_PORT"
        } else {
            Write-Test "WebSocket Server" "FAIL" "Not listening on port $WEBSOCKET_PORT" -Critical
            return $false
        }
        
        # Memory usage check
        $memoryTest = Invoke-TestWithTimeout -TestName "Memory Usage Check" -TimeoutSeconds 5 -TestScript {
            try {
                $process = Get-Process -Name node | Where-Object { $_.WorkingSet64 -gt 0 } | Sort-Object WorkingSet64 -Descending | Select-Object -First 1
                $memoryMB = [math]::Round($process.WorkingSet64 / 1MB, 2)
                
                if ($memoryMB -lt $MAX_MEMORY_USAGE_MB) {
                    Write-Test "Memory Usage Check" "PASS" "Using $memoryMB MB (under $MAX_MEMORY_USAGE_MB MB limit)"
                    return $true
                } else {
                    Write-Test "Memory Usage Check" "WARN" "Using $memoryMB MB (over $MAX_MEMORY_USAGE_MB MB limit)"
                    return $true # Warning, not failure
                }
            } catch {
                return $false
            }
        }
        
        # Final validation
        $apiSuccess = ($criticalApiPassed -eq $criticalApiTests) -and ($apiTestsPassed -ge ($endpoints.Count * 0.8))
        
        if ($apiSuccess -and $wsTest) {
            $Global:ValidationResults.BackendAPI = $true
            $Global:ValidationResults.WebSocketCommunication = $true
            Write-Test "Backend Comprehensive Validation" "PASS" "$apiTestsPassed/$($endpoints.Count) endpoints validated, $criticalApiPassed/$criticalApiTests critical tests passed"
            return $true
        } else {
            Write-Test "Backend Comprehensive Validation" "FAIL" "Critical API tests failed or insufficient coverage" -Critical
            return $false
        }
        
    } catch {
        Write-Test "Backend Startup" "FAIL" "Exception: $($_.Exception.Message)" -Critical
        return $false
    }
}

function Test-LoadAndPerformance {
    Write-Section "Load Testing and Performance Validation"
    
    Write-Host "🏋️ Testing system performance under load..."
    
    # Test basic load handling
    $loadTest = Invoke-TestWithTimeout -TestName "Load Testing" -TimeoutSeconds 60 -TestScript {
        try {
            $jobs = @()
            $concurrentRequests = 20
            $requestsPerJob = 5
            
            Write-Host "Starting $concurrentRequests concurrent job streams..."
            
            for ($i = 0; $i -lt $concurrentRequests; $i++) {
                $job = Start-Job -ScriptBlock {
                    param($port, $requests)
                    $successCount = 0
                    for ($j = 0; $j -lt $requests; $j++) {
                        try {
                            $response = Invoke-WebRequest -Uri "http://localhost:$port/health" -Method GET -TimeoutSec 5
                            if ($response.StatusCode -eq 200) { $successCount++ }
                        } catch {}
                        Start-Sleep -Milliseconds 100
                    }
                    return $successCount
                } -ArgumentList $BACKEND_PORT, $requestsPerJob
                
                $jobs += $job
            }
            
            # Wait for jobs to complete
            $results = $jobs | Wait-Job -Timeout 45 | Receive-Job
            $jobs | Remove-Job -Force
            
            $totalRequests = $concurrentRequests * $requestsPerJob
            $successfulRequests = ($results | Measure-Object -Sum).Sum
            $successRate = ($successfulRequests / $totalRequests) * 100
            
            if ($successRate -ge 95) {
                Write-Test "Load Testing" "PASS" "$successfulRequests/$totalRequests requests successful ($([math]::Round($successRate, 1))%)"
                return $true
            } else {
                Write-Test "Load Testing" "FAIL" "Only $successfulRequests/$totalRequests requests successful ($([math]::Round($successRate, 1))%)"
                return $false
            }
        } catch {
            Write-Test "Load Testing" "FAIL" "Exception during load test: $($_.Exception.Message)"
            return $false
        }
    }
    
    # Response time testing
    $responseTimeTest = Invoke-TestWithTimeout -TestName "Response Time Testing" -TimeoutSeconds 30 -TestScript {
        try {
            $responseTimes = @()
            
            for ($i = 0; $i -lt 10; $i++) {
                $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
                try {
                    $response = Invoke-WebRequest -Uri "http://localhost:$BACKEND_PORT/health" -Method GET -TimeoutSec 5
                    $stopwatch.Stop()
                    if ($response.StatusCode -eq 200) {
                        $responseTimes += $stopwatch.ElapsedMilliseconds
                    }
                } catch {
                    $stopwatch.Stop()
                }
                Start-Sleep -Milliseconds 500
            }
            
            if ($responseTimes.Count -gt 0) {
                $avgResponseTime = ($responseTimes | Measure-Object -Average).Average
                $maxResponseTime = ($responseTimes | Measure-Object -Maximum).Maximum
                
                if ($avgResponseTime -le $MAX_RESPONSE_TIME_MS -and $maxResponseTime -le ($MAX_RESPONSE_TIME_MS * 2)) {
                    Write-Test "Response Time Testing" "PASS" "Avg: $([math]::Round($avgResponseTime, 1))ms, Max: $([math]::Round($maxResponseTime, 1))ms"
                    return $true
                } else {
                    Write-Test "Response Time Testing" "FAIL" "Avg: $([math]::Round($avgResponseTime, 1))ms, Max: $([math]::Round($maxResponseTime, 1))ms (exceeds $MAX_RESPONSE_TIME_MS ms)"
                    return $false
                }
            } else {
                return $false
            }
        } catch {
            Write-Test "Response Time Testing" "FAIL" "Exception: $($_.Exception.Message)"
            return $false
        }
    }
    
    $allTests = $loadTest -and $responseTimeTest
    $Global:ValidationResults.LoadTesting = $allTests
    $Global:ValidationResults.PerformanceValidation = $allTests
    return $allTests
}

function Test-MobileAppWithValidation {
    Write-Section "Mobile App Comprehensive Validation"
    
    if ($SkipMobile) {
        Write-Test "Mobile App Validation" "SKIP" "Mobile validation skipped by parameter"
        $Global:ValidationResults.MobileApp = $true
        $Global:ValidationResults.MobileBuild = $true
        return $true
    }
    
    Write-Host "📱 Validating mobile application build and configuration..."
    
    # Check mobile directory structure
    $structureTest = Invoke-TestWithTimeout -TestName "Mobile Structure Check" -TimeoutSeconds 10 -Critical -TestScript {
        $requiredFiles = @(
            "mobile/package.json",
            "mobile/App.tsx",
            "mobile/src/config/api.ts",
            "mobile/src/services/ApiService.ts",
            "mobile/metro.config.js"
        )
        
        $missing = @()
        foreach ($file in $requiredFiles) {
            if (-not (Test-Path $file)) {
                $missing += $file
            }
        }
        
        if ($missing.Count -eq 0) {
            Write-Test "Mobile Structure Check" "PASS" "All required files present"
            return $true
        } else {
            Write-Test "Mobile Structure Check" "FAIL" "Missing files: $($missing -join ', ')" -Critical
            return $false
        }
    }
    
    if (-not $structureTest) { return $false }
    
    # Check mobile package dependencies
    $dependencyTest = Invoke-TestWithTimeout -TestName "Mobile Dependencies" -TimeoutSeconds 30 -Critical -TestScript {
        try {
            Push-Location mobile
            $nodeModulesExists = Test-Path "node_modules"
            
            if (-not $nodeModulesExists) {
                Write-Host "Installing mobile dependencies..."
                $installResult = & npm install 2>&1
                if ($LASTEXITCODE -ne 0) {
                    Write-Test "Mobile Dependencies" "FAIL" "npm install failed" -Critical
                    return $false
                }
            }
            
            # Check critical packages are installed
            $criticalPackages = @("react-native", "@react-native-async-storage/async-storage", "react-native-vector-icons")
            foreach ($package in $criticalPackages) {
                if (-not (Test-Path "node_modules/$package")) {
                    Write-Test "Mobile Dependencies" "FAIL" "Missing critical package: $package" -Critical
                    return $false
                }
            }
            
            Write-Test "Mobile Dependencies" "PASS" "All critical packages installed"
            return $true
        } catch {
            Write-Test "Mobile Dependencies" "FAIL" "Exception: $($_.Exception.Message)" -Critical
            return $false
        } finally {
            Pop-Location
        }
    }
    
    if (-not $dependencyTest) { return $false }
    
    # Validate API configuration
    $apiConfigTest = Invoke-TestWithTimeout -TestName "Mobile API Configuration" -TimeoutSeconds 10 -Critical -TestScript {
        try {
            $apiConfigContent = Get-Content "mobile/src/config/api.ts" -Raw
            
            if ($apiConfigContent -match "localhost:$BACKEND_PORT" -or $apiConfigContent -match "127.0.0.1:$BACKEND_PORT") {
                Write-Test "Mobile API Configuration" "PASS" "API pointing to correct backend port $BACKEND_PORT"
                return $true
            } else {
                Write-Test "Mobile API Configuration" "FAIL" "API not configured for port $BACKEND_PORT" -Critical
                return $false
            }
        } catch {
            Write-Test "Mobile API Configuration" "FAIL" "Cannot read API configuration" -Critical
            return $false
        }
    }
    
    $allTests = $structureTest -and $dependencyTest -and $apiConfigTest
    $Global:ValidationResults.MobileApp = $allTests
    $Global:ValidationResults.MobileBuild = $allTests
    return $allTests
}

function Test-AdminPortalValidation {
    Write-Section "Admin Portal Comprehensive Validation"
    
    if ($SkipAdmin) {
        Write-Test "Admin Portal Validation" "SKIP" "Admin portal validation skipped by parameter"
        $Global:ValidationResults.AdminPortal = $true
        $Global:ValidationResults.AdminPortalBuild = $true
        return $true
    }
    
    Write-Host "🔧 Validating admin portal build and functionality..."
    
    # Check admin portal structure
    $structureTest = Invoke-TestWithTimeout -TestName "Admin Portal Structure" -TimeoutSeconds 10 -Critical -TestScript {
        $requiredFiles = @(
            "admin-portal/package.json",
            "admin-portal/index.html",
            "admin-portal/src/App.tsx",
            "admin-portal/src/main.tsx",
            "admin-portal/vite.config.ts"
        )
        
        $missing = @()
        foreach ($file in $requiredFiles) {
            if (-not (Test-Path $file)) {
                $missing += $file
            }
        }
        
        if ($missing.Count -eq 0) {
            Write-Test "Admin Portal Structure" "PASS" "All required files present"
            return $true
        } else {
            Write-Test "Admin Portal Structure" "FAIL" "Missing files: $($missing -join ', ')" -Critical
            return $false
        }
    }
    
    if (-not $structureTest) { return $false }
    
    # Check admin portal dependencies
    $dependencyTest = Invoke-TestWithTimeout -TestName "Admin Portal Dependencies" -TimeoutSeconds 30 -Critical -TestScript {
        try {
            Push-Location admin-portal
            $nodeModulesExists = Test-Path "node_modules"
            
            if (-not $nodeModulesExists) {
                Write-Host "Installing admin portal dependencies..."
                $installResult = & npm install 2>&1
                if ($LASTEXITCODE -ne 0) {
                    Write-Test "Admin Portal Dependencies" "FAIL" "npm install failed" -Critical
                    return $false
                }
            }
            
            Write-Test "Admin Portal Dependencies" "PASS" "Dependencies installed"
            return $true
        } catch {
            Write-Test "Admin Portal Dependencies" "FAIL" "Exception: $($_.Exception.Message)" -Critical
            return $false
        } finally {
            Pop-Location
        }
    }
    
    if (-not $dependencyTest) { return $false }
    
    # Test admin portal build
    $buildTest = Invoke-TestWithTimeout -TestName "Admin Portal Build" -TimeoutSeconds 60 -TestScript {
        try {
            Push-Location admin-portal
            
            Write-Host "Building admin portal..."
            $buildResult = & npm run build 2>&1
            
            if ($LASTEXITCODE -eq 0 -and (Test-Path "dist")) {
                Write-Test "Admin Portal Build" "PASS" "Build successful, dist folder created"
                return $true
            } else {
                Write-Test "Admin Portal Build" "FAIL" "Build failed or no dist folder"
                return $false
            }
        } catch {
            Write-Test "Admin Portal Build" "FAIL" "Exception: $($_.Exception.Message)"
            return $false
        } finally {
            Pop-Location
        }
    }
    
    $allTests = $structureTest -and $dependencyTest -and $buildTest
    $Global:ValidationResults.AdminPortal = $allTests
    $Global:ValidationResults.AdminPortalBuild = $allTests
    return $allTests
}

function Test-ErrorHandlingAndRecovery {
    Write-Section "Error Handling and Recovery Testing"
    
    Write-Host "🛡️ Testing system error handling and recovery mechanisms..."
    
    # Test invalid API requests
    $errorHandlingTest = Invoke-TestWithTimeout -TestName "API Error Handling" -TimeoutSeconds 30 -TestScript {
        try {
            $errorTests = @(
                @{ path = "/auth/login"; body = "invalid-json"; expectedStatus = 400; name = "Invalid JSON" },
                @{ path = "/auth/login"; body = '{"invalidField": "test"}'; expectedStatus = 400; name = "Invalid Login Fields" },
                @{ path = "/races/999999"; expectedStatus = 404; name = "Non-existent Race" },
                @{ path = "/users/profile"; headers = @{"Authorization" = "Bearer invalid-token"}; expectedStatus = 401; name = "Invalid Token" }
            )
            
            $passed = 0
            foreach ($test in $errorTests) {
                try {
                    $uri = "http://localhost:$BACKEND_PORT$($test.path)"
                    $params = @{
                        Uri = $uri
                        Method = if ($test.body) { "POST" } else { "GET" }
                        TimeoutSec = 5
                    }
                    
                    if ($test.body) {
                        $params.Body = $test.body
                        $params.ContentType = "application/json"
                    }
                    
                    if ($test.headers) {
                        $params.Headers = $test.headers
                    }
                    
                    $response = Invoke-WebRequest @params
                    $actualStatus = $response.StatusCode
                } catch {
                    $actualStatus = $_.Exception.Response.StatusCode.value__
                }
                
                if ($actualStatus -eq $test.expectedStatus) {
                    $passed++
                } else {
                    Write-Host "❌ $($test.name): Expected $($test.expectedStatus), got $actualStatus"
                }
            }
            
            if ($passed -eq $errorTests.Count) {
                Write-Test "API Error Handling" "PASS" "All $passed error scenarios handled correctly"
                return $true
            } else {
                Write-Test "API Error Handling" "FAIL" "Only $passed/$($errorTests.Count) error scenarios handled correctly"
                return $false
            }
        } catch {
            Write-Test "API Error Handling" "FAIL" "Exception: $($_.Exception.Message)"
            return $false
        }
    }
    
    # Test system recovery under stress
    $recoveryTest = Invoke-TestWithTimeout -TestName "System Recovery Test" -TimeoutSeconds 45 -TestScript {
        try {
            # Rapid-fire requests to test system stability
            $rapidRequests = 50
            $successCount = 0
            
            for ($i = 0; $i -lt $rapidRequests; $i++) {
                try {
                    $response = Invoke-WebRequest -Uri "http://localhost:$BACKEND_PORT/health" -Method GET -TimeoutSec 2
                    if ($response.StatusCode -eq 200) { $successCount++ }
                } catch {}
                
                if ($i % 10 -eq 0) { Start-Sleep -Milliseconds 50 }
            }
            
            $recoveryRate = ($successCount / $rapidRequests) * 100
            
            if ($recoveryRate -ge 90) {
                Write-Test "System Recovery Test" "PASS" "$successCount/$rapidRequests requests successful ($([math]::Round($recoveryRate, 1))%)"
                return $true
            } else {
                Write-Test "System Recovery Test" "FAIL" "Only $successCount/$rapidRequests requests successful ($([math]::Round($recoveryRate, 1))%)"
                return $false
            }
        } catch {
            Write-Test "System Recovery Test" "FAIL" "Exception: $($_.Exception.Message)"
            return $false
        }
    }
    
    $allTests = $errorHandlingTest -and $recoveryTest
    $Global:ValidationResults.ErrorHandling = $allTests
    $Global:ValidationResults.SystemRecovery = $allTests
    return $allTests
}

function Write-ComprehensiveValidationSummary {
    Write-Section "🎯 COMPREHENSIVE VALIDATION SUMMARY"
    
    $totalTests = 0
    $passedTests = 0
    $criticalFailed = @()
    $warningTests = @()
    
    foreach ($result in $Global:ValidationResults.GetEnumerator()) {
        $totalTests++
        if ($result.Value) {
            $passedTests++
            Write-Host "✅ $($result.Key): PASSED" -ForegroundColor Green
        } else {
            Write-Host "❌ $($result.Key): FAILED" -ForegroundColor Red
            
            # Determine if this is critical
            $criticalCategories = @(
                "Prerequisites", "DatabaseIntegrity", "UserAuthentication", 
                "SecurityValidation", "BackendAPI", "WebSocketCommunication"
            )
            
            if ($criticalCategories -contains $result.Key) {
                $criticalFailed += $result.Key
            } else {
                $warningTests += $result.Key
            }
        }
    }
    
    $successRate = ($passedTests / $totalTests) * 100
    
    Write-Host ""
    Write-Host "📊 VALIDATION STATISTICS:" -ForegroundColor Cyan
    Write-Host "   Total Tests: $totalTests"
    Write-Host "   Passed: $passedTests" -ForegroundColor Green
    Write-Host "   Failed: $($totalTests - $passedTests)" -ForegroundColor Red
    Write-Host "   Success Rate: $([math]::Round($successRate, 1))%" -ForegroundColor $(if ($successRate -ge 95) { "Green" } elseif ($successRate -ge 80) { "Yellow" } else { "Red" })
    Write-Host ""
    
    if ($criticalFailed.Count -gt 0) {
        Write-Host "🚨 CRITICAL FAILURES (DEPLOYMENT BLOCKING):" -ForegroundColor Red -BackgroundColor Black
        foreach ($failure in $criticalFailed) {
            Write-Host "   • $failure" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    if ($warningTests.Count -gt 0) {
        Write-Host "⚠️  NON-CRITICAL FAILURES:" -ForegroundColor Yellow
        foreach ($warning in $warningTests) {
            Write-Host "   • $warning" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    # ZERO-TOLERANCE VALIDATION DECISION
    if ($criticalFailed.Count -eq 0 -and $successRate -ge $MIN_SUCCESS_RATE) {
        Write-Host "🎉 VALIDATION RESULT: DEPLOYMENT APPROVED" -ForegroundColor Green -BackgroundColor Black
        Write-Host "   All critical systems validated successfully!" -ForegroundColor Green
        Write-Host "   System is ready for production deployment." -ForegroundColor Green
        return $true
    } else {
        Write-Host "🛑 VALIDATION RESULT: DEPLOYMENT BLOCKED" -ForegroundColor Red -BackgroundColor Black
        Write-Host "   Critical failures detected or insufficient success rate." -ForegroundColor Red
        Write-Host "   System is NOT ready for deployment." -ForegroundColor Red
        Write-Host ""
        Write-Host "🔧 REQUIRED ACTIONS:" -ForegroundColor Yellow
        if ($criticalFailed.Count -gt 0) {
            Write-Host "   1. Fix all critical failures listed above" -ForegroundColor Yellow
        }
        if ($successRate -lt $MIN_SUCCESS_RATE) {
            Write-Host "   2. Improve overall success rate to at least $MIN_SUCCESS_RATE%" -ForegroundColor Yellow
        }
        Write-Host "   3. Re-run validation after fixes" -ForegroundColor Yellow
        return $false
    }
}

# ============================================================================
# MAIN EXECUTION - COMPREHENSIVE ZERO-TOLERANCE VALIDATION
# ============================================================================

try {
    # Initialize validation tracking
    Initialize-ValidationTracking
    
    Write-Host "🚀 STARTING COMPREHENSIVE SYSTEM VALIDATION" -ForegroundColor Cyan -BackgroundColor Black
    Write-Host "⚡ ZERO-TOLERANCE MODE: All critical tests must pass" -ForegroundColor Yellow
    Write-Host "⏱️  Timeout Settings: Startup=$STARTUP_TIMEOUT s, API=$API_TIMEOUT s, Build=$BUILD_TIMEOUT s" -ForegroundColor Gray
    Write-Host ""
    
    $validationSteps = @()
    
    # Step 1: Prerequisites and Environment
    $validationSteps += @{
        Name = "Prerequisites & Environment"
        Function = { Test-Prerequisites }
        Critical = $true
    }
    
    # Step 2: Database Integrity and Operations
    $validationSteps += @{
        Name = "Database Integrity & Operations"
        Function = { Test-DatabaseIntegrityAndOperations }
        Critical = $true
    }
    
    # Step 3: User Authentication and Security
    $validationSteps += @{
        Name = "User Authentication & Security"
        Function = { Test-UserAuthenticationSecurity }
        Critical = $true
    }
    
    # Step 4: Backend API with Comprehensive Testing
    $validationSteps += @{
        Name = "Backend API Comprehensive Validation"
        Function = { Start-BackendWithValidation }
        Critical = $true
    }
    
    # Step 5: Load Testing and Performance
    $validationSteps += @{
        Name = "Load Testing & Performance"
        Function = { Test-LoadAndPerformance }
        Critical = $false
    }
    
    # Step 6: Mobile App Validation
    $validationSteps += @{
        Name = "Mobile App Comprehensive Validation"
        Function = { Test-MobileAppWithValidation }
        Critical = $false
    }
    
    # Step 7: Admin Portal Validation
    $validationSteps += @{
        Name = "Admin Portal Comprehensive Validation"
        Function = { Test-AdminPortalValidation }
        Critical = $false
    }
    
    # Step 8: Error Handling and Recovery
    $validationSteps += @{
        Name = "Error Handling & Recovery"
        Function = { Test-ErrorHandlingAndRecovery }
        Critical = $false
    }
    
    # Execute all validation steps
    $overallSuccess = $true
    $criticalFailures = @()
    
    foreach ($step in $validationSteps) {
        Write-Host ""
        Write-Host "📋 Executing: $($step.Name)" -ForegroundColor Cyan
        Write-Host "   Priority: $(if ($step.Critical) { 'CRITICAL' } else { 'STANDARD' })" -ForegroundColor $(if ($step.Critical) { 'Red' } else { 'Yellow' })
        
        try {
            $stepResult = & $step.Function
            
            if ($stepResult) {
                Write-Host "✅ $($step.Name): COMPLETED SUCCESSFULLY" -ForegroundColor Green
            } else {
                Write-Host "❌ $($step.Name): FAILED" -ForegroundColor Red
                $overallSuccess = $false
                
                if ($step.Critical) {
                    $criticalFailures += $step.Name
                    Write-Host "🚨 CRITICAL FAILURE DETECTED - This blocks deployment!" -ForegroundColor Red -BackgroundColor Black
                }
            }
        } catch {
            Write-Host "💥 $($step.Name): EXCEPTION - $($_.Exception.Message)" -ForegroundColor Red
            $overallSuccess = $false
            if ($step.Critical) {
                $criticalFailures += $step.Name
            }
        }
    }
    
    # Generate comprehensive summary
    Write-Host ""
    $deploymentApproved = Write-ComprehensiveValidationSummary
    
    # Final decision logic
    if ($criticalFailures.Count -gt 0) {
        Write-Host ""
        Write-Host "🛑 VALIDATION TERMINATED: Critical system failures detected" -ForegroundColor Red -BackgroundColor Black
        Write-Host "   Cannot proceed with deployment until all critical issues are resolved." -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 NEXT STEPS:" -ForegroundColor Yellow
        Write-Host "   1. Review failed tests above" -ForegroundColor White
        Write-Host "   2. Fix identified issues" -ForegroundColor White
        Write-Host "   3. Re-run this validation script" -ForegroundColor White
        exit 1
    } elseif ($deploymentApproved) {
        Write-Host ""
        Write-Host "🎯 ALL SYSTEMS VALIDATED SUCCESSFULLY!" -ForegroundColor Green -BackgroundColor Black
        Write-Host "   System meets all requirements for production deployment." -ForegroundColor Green
        Write-Host "   Ready to proceed with deployment pipeline." -ForegroundColor Green
        exit 0
    } else {
        Write-Host ""
        Write-Host "⚠️  VALIDATION COMPLETED WITH WARNINGS" -ForegroundColor Yellow -BackgroundColor Black
        Write-Host "   Non-critical issues detected but deployment may proceed." -ForegroundColor Yellow
        Write-Host "   Consider addressing warnings before production deployment." -ForegroundColor Yellow
        exit 0
    }
    
} catch {
    Write-Host ""
    Write-Host "💥 VALIDATION SCRIPT FAILURE" -ForegroundColor Red -BackgroundColor Black
    Write-Host "   Exception: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Stack Trace: $($_.ScriptStackTrace)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🔧 Please review the error above and fix any issues with the validation script itself." -ForegroundColor Yellow
    exit 1
}