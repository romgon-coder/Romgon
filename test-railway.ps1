# Test Railway Backend Health
Write-Host "🔍 Testing Railway Backend Health..." -ForegroundColor Cyan
Write-Host ""

$maxAttempts = 10
$attempt = 1

while ($attempt -le $maxAttempts) {
    Write-Host "Attempt $attempt/$maxAttempts..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "https://api.romgon.net/api/health" -TimeoutSec 5 -UseBasicParsing
        
        Write-Host "✅ Backend is ONLINE!" -ForegroundColor Green
        Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Cyan
        Write-Host $response.Content -ForegroundColor White
        
        # Test database endpoint
        Write-Host "`n🗄️ Testing Database Connection..." -ForegroundColor Cyan
        $dbResponse = Invoke-WebRequest -Uri "https://api.romgon.net/api/debug/database" -TimeoutSec 5 -UseBasicParsing
        Write-Host $dbResponse.Content -ForegroundColor White
        
        Write-Host "`n✅ All systems operational!" -ForegroundColor Green
        exit 0
        
    } catch {
        Write-Host "❌ Not responding yet: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($attempt -lt $maxAttempts) {
            Write-Host "⏳ Waiting 15 seconds before retry..." -ForegroundColor Yellow
            Start-Sleep -Seconds 15
        }
    }
    
    $attempt++
}

Write-Host "`n⚠️ Backend still not responding after $maxAttempts attempts" -ForegroundColor Red
Write-Host "Please check Railway Dashboard logs at: https://railway.app/dashboard" -ForegroundColor Yellow
