# Build deploy folder for deployment to GitHub Pages or Cloudflare Pages
# Usage (PowerShell):
#   .\deploy\build.ps1
# This script copies the main HTML and asset folders into ./deploy

$srcHtml = 'ROMGON 2 SHAPES WORKING.html'
$deployDir = Join-Path -Path (Get-Location) -ChildPath 'deploy'

if (-not (Test-Path $deployDir)) {
    New-Item -Path $deployDir -ItemType Directory | Out-Null
}

Write-Host "Copying $srcHtml -> $deployDir\index.html"
Copy-Item -Path $srcHtml -Destination (Join-Path $deployDir 'index.html') -Force

# Copy common asset folders (adjust as needed)
$folders = @('ASSETS','ROMGON HEX')
try {
    # Decide which folders to copy: always copy ASSETS; copy ROMGON HEX only if referenced in the HTML
    $foldersToCopy = @()
    $foldersToCopy += 'ASSETS'

    # Inspect the source HTML for references to the ROMGON HEX folder
    $htmlContent = Get-Content -Path $srcHtml -Raw -ErrorAction Stop
    if ($htmlContent -match 'ROMGON\s*HEX' -or $htmlContent -match 'ROMGON\s*HEX/') {
        $foldersToCopy += 'ROMGON HEX'
        Write-Host "Detected references to 'ROMGON HEX' in $srcHtml — will copy that folder."
    } else {
        Write-Host "No references to 'ROMGON HEX' found in $srcHtml — skipping that folder to keep deploy small."
    }
} catch {
    Write-Host "Warning: could not read $srcHtml to detect references; defaulting to copy both folders." -ForegroundColor Yellow
    $foldersToCopy += 'ROMGON HEX'
}

$folders = $foldersToCopy
foreach ($f in $folders) {
    if (Test-Path $f) {
        Write-Host "Copying folder $f to deploy..."
        $dest = Join-Path $deployDir $f
        if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
        Copy-Item -Path $f -Destination $deployDir -Recurse -Force
    } else { Write-Host "Warning: $f not found, skipping." }
}

# Optional: copy node server files if you want a Node backend alongside static files
foreach ($file in @('server.js','package.json')) {
    if (Test-Path $file) {
        Write-Host "Copying $file to deploy..."
        Copy-Item -Path $file -Destination $deployDir -Force
    }
}

# Add GitHub Pages helper files
Set-Content -Path (Join-Path $deployDir '.nojekyll') -Value '' -Force
# Replace the domain below with your domain if different
Set-Content -Path (Join-Path $deployDir 'CNAME') -Value 'romgon.net' -Force

Write-Host "Deploy folder ready at: $deployDir"
Write-Host "Next: git add/commit & push the contents of ./deploy to the branch or location you will use for Pages/Cloudflare."