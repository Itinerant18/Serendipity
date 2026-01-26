# Serendipity Environment Setup Script
# This script helps set up the .env files for both backend and frontend

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Serendipity Environment Setup" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Backend .env setup
$backendEnvPath = "backend\.env"
$backendEnvContent = @"
# ===========================================
# Serendipity Backend Environment Variables
# ===========================================

# Server Configuration
PORT=5000
NODE_ENV=development

# ===========================================
# Main Supabase Database Configuration
# ===========================================
# Used for: Users, Orders, Cart, Admin Products

# Main Database URL
SUPABASE_URL=https://wosxyoivsiqzyufhcyhy.supabase.co

# Main Database Anon/Public Key (Safe for client-side)
SUPABASE_KEY=your_main_supabase_anon_key_here

# Main Database Service Role Key (Backend only - NEVER expose!)
SUPABASE_SERVICE_KEY=your_main_supabase_service_role_key_here

# ===========================================
# Seller Supabase Database Configuration
# ===========================================
# Used for: Seller Profiles, Seller Products, Seller-specific data

# Seller Database URL
SELLER_SUPABASE_URL=https://kfyocccbvsanihtzrfmb.supabase.co

# Seller Database Anon/Public Key
SELLER_SUPABASE_KEY=sb_publishable_ibPvVNwwUHm7xwr5DZP4-g_XUJqmcPb

# Seller Database Service Role Key (Backend only - NEVER expose!)
SELLER_SUPABASE_SERVICE_KEY=your_seller_supabase_service_role_key_here

# ===========================================
# Authentication
# ===========================================
# Optional: JWT Secret (if using custom JWT instead of Supabase Auth)
JWT_SECRET=your_jwt_secret_here

# ===========================================
# Payment Processing
# ===========================================

# Razorpay Configuration (Indian Payment Gateway)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Stripe Configuration (International Payment Gateway)
STRIPE_SECRET_KEY=your_stripe_secret_key_here
"@

# Frontend .env setup
$frontendEnvPath = "frontensd\apps\web\.env"
$frontendEnvContent = @"
# ===========================================
# Serendipity Frontend Environment Variables
# ===========================================

# Server Configuration
NODE_ENV=development

# ===========================================
# Main Supabase Database Configuration
# ===========================================
# Used for: User Authentication, Customer Data

# Main Database URL
VITE_SUPABASE_URL=https://wosxyoivsiqzyufhcyhy.supabase.co

# Main Database Anon/Public Key
VITE_SUPABASE_ANON_KEY=your_main_supabase_anon_key_here

# ===========================================
# API Configuration
# ===========================================

# Backend API URL
VITE_API_URL=http://localhost:5000

# Socket.IO Server URL (for real-time features)
VITE_SOCKET_URL=http://localhost:5000

# ===========================================
# Authentication
# ===========================================

# Auth Secret (for session management)
AUTH_SECRET=your_auth_secret_here
"@

# Create backend .env if it doesn't exist
if (-not (Test-Path $backendEnvPath)) {
    Write-Host "Creating backend .env file..." -ForegroundColor Yellow
    $backendEnvContent | Out-File -FilePath $backendEnvPath -Encoding UTF8
    Write-Host "✓ Backend .env file created at: $backendEnvPath" -ForegroundColor Green
}
else {
    Write-Host "⚠ Backend .env file already exists at: $backendEnvPath" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -eq "y" -or $overwrite -eq "Y") {
        $backendEnvContent | Out-File -FilePath $backendEnvPath -Encoding UTF8
        Write-Host "✓ Backend .env file updated" -ForegroundColor Green
    }
}

# Create frontend .env if it doesn't exist
if (-not (Test-Path $frontendEnvPath)) {
    Write-Host "Creating frontend .env file..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path "frontensd\apps\web" | Out-Null
    $frontendEnvContent | Out-File -FilePath $frontendEnvPath -Encoding UTF8
    Write-Host "✓ Frontend .env file created at: $frontendEnvPath" -ForegroundColor Green
}
else {
    Write-Host "⚠ Frontend .env file already exists at: $frontendEnvPath" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -eq "y" -or $overwrite -eq "Y") {
        $frontendEnvContent | Out-File -FilePath $frontendEnvPath -Encoding UTF8
        Write-Host "✓ Frontend .env file updated" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "1. Update the .env files with your actual credentials" -ForegroundColor White
Write-Host "2. Get your Supabase keys from:" -ForegroundColor White
Write-Host "   - Main DB: https://supabase.com/dashboard -> Project wosxyoivsiqzyufhcyhy" -ForegroundColor Gray
Write-Host "   - Seller DB: https://supabase.com/dashboard -> Project kfyocccbvsanihtzrfmb" -ForegroundColor Gray
Write-Host "3. See ENV_SETUP.md for detailed instructions" -ForegroundColor White
Write-Host ""
Write-Host "⚠ IMPORTANT: Update the placeholder values with your actual credentials!" -ForegroundColor Red
Write-Host ""
