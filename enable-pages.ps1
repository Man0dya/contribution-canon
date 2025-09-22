# PowerShell script to enable GitHub Pages
# You need to run this manually with your GitHub token

$repo = "Man0dya/contribution-canon"
$token = "YOUR_GITHUB_TOKEN_HERE"  # Replace with your actual token

$headers = @{
    "Accept" = "application/vnd.github+json"
    "Authorization" = "Bearer $token"
    "X-GitHub-Api-Version" = "2022-11-28"
}

$body = @{
    source = @{
        branch = "gh-pages"
        path = "/"
    }
    build_type = "legacy"
} | ConvertTo-Json

try {
    # Try to create Pages
    $response = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/pages" -Method POST -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "GitHub Pages enabled successfully!" -ForegroundColor Green
    Write-Host "Site URL: $($response.html_url)" -ForegroundColor Cyan
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "GitHub Pages already exists, updating..." -ForegroundColor Yellow
        try {
            # Try to update existing Pages
            $response = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/pages" -Method PUT -Headers $headers -Body $body -ContentType "application/json"
            Write-Host "GitHub Pages updated successfully!" -ForegroundColor Green
            Write-Host "Site URL: $($response.html_url)" -ForegroundColor Cyan
        } catch {
            Write-Host "Error updating Pages: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "Error enabling Pages: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Please enable GitHub Pages manually in repository settings." -ForegroundColor Yellow
    }
}