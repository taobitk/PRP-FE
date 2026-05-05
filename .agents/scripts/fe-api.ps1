# ============================================================================
# 🔍 FE API Scanner — Quét danh sách API calls trong dự án Next.js/TypeScript
# ============================================================================
# Cách dùng: .\fe-api.ps1 [-TargetDir "src"] [-StartPrefix ""]
#
# Script quét các file .ts/.tsx tìm các lời gọi apiClient() và trích xuất:
#   - HTTP Method (GET, POST, PUT, DELETE, PATCH)
#   - Endpoint URL
# Hiển thị dạng cây giống script go-api.ps1 bên Backend.
# ============================================================================

param([string]$TargetDir = 'src', [string]$StartPrefix = '')

# Ép console dùng UTF-8 để hiển thị ký tự Unicode đúng chuẩn
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Định nghĩa các ký tự vẽ cây chuẩn tree /f bằng mã Hex
$charL = [char]0x2514 # └
$charT = [char]0x251C # ├
$charH = [char]0x2500 # ─
$charV = [char]0x2502 # │

$global:markerLast = "$charL$charH$charH$charH"      # └───
$global:markerNotLast = "$charT$charH$charH$charH"   # ├───
$global:eMarkerLast = "$charL$charH$charH "          # └── 
$global:eMarkerNotLast = "$charT$charH$charH "       # ├── 
$global:pipeSpace = "$charV   "                      # │   

function Extract-ApiCalls {
    <#
    .SYNOPSIS
    Trích xuất danh sách API calls từ một file TypeScript.
    
    .DESCRIPTION
    Quét từng dòng tìm lời gọi apiClient, sau đó quét các dòng lân cận 
    để tìm method. Nếu không tìm thấy method → mặc định GET.
    #>
    param([string]$FilePath)
    
    $results = @()
    $lines = Get-Content -Path $FilePath -Encoding UTF8
    
    for ($idx = 0; $idx -lt $lines.Count; $idx++) {
        $line = $lines[$idx]
        
        # Tìm dòng chứa lời gọi apiClient với endpoint
        # Dùng nháy đơn để tránh PowerShell escape backtick
        $apiPattern = [regex]::new('apiClient[^(]*\(\s*[`''"](/?[^`''"]+)[`''"]')
        $m = $apiPattern.Match($line)
        if ($m.Success) {
            $endpoint = $m.Groups[1].Value
            
            # Đảm bảo endpoint bắt đầu bằng /
            if (-not $endpoint.StartsWith('/')) { continue }
            
            # Chuẩn hóa template literal: ${id} → :id
            $endpoint = $endpoint -replace '\$\{[^}]+\}', ':id'
            # Chuẩn hóa query string
            $endpoint = $endpoint -replace '\?.*$', ''
            
            # Quét dòng hiện tại + 5 dòng tiếp theo tìm method
            $method = 'GET'  # Mặc định
            $searchEnd = [Math]::Min($idx + 5, $lines.Count - 1)
            for ($j = $idx; $j -le $searchEnd; $j++) {
                # Dùng regex đơn giản: tìm method: theo sau bởi tên method
                if ($lines[$j] -match 'method:\s*\W(\w+)\W') {
                    $method = $Matches[1].ToUpper()
                    break
                }
            }
            
            $results += "[API] $method $endpoint"
        }
    }
    
    # Loại bỏ trùng lặp và sắp xếp
    return $results | Sort-Object -Unique
}

function Show-ApiTree {
    param([string]$Dir = '.', [string]$Prefix = '')
    
    # Bỏ qua các thư mục rác
    $excludePattern = '^(node_modules|\.next|\.git|\.idea|\.vscode|dist|coverage|\.swc|test-results|playwright-report)$'
    $items = Get-ChildItem -Path $Dir -Directory | Where-Object { $_.Name -notmatch $excludePattern } | Sort-Object Name
    $files = Get-ChildItem -Path $Dir -File | Where-Object { $_.Extension -match '^\.(ts|tsx)$' } | Sort-Object Name
    
    # 1. Lọc thư mục con có chứa lời gọi API (đệ quy)
    $validDirs = @()
    foreach ($dirItem in $items) {
        $hasApi = $false
        $tsFiles = Get-ChildItem -Path $dirItem.FullName -Recurse -File -Include "*.ts","*.tsx" -ErrorAction SilentlyContinue
        foreach ($f in $tsFiles) {
            $text = Get-Content -Path $f.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
            if ($text -and $text -match 'apiClient') {
                $hasApi = $true
                break
            }
        }
        if ($hasApi) {
            $validDirs += $dirItem
        }
    }

    # 2. Lọc file .ts/.tsx có lời gọi apiClient
    $validFiles = @()
    foreach ($file in $files) {
        $text = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        if ($text -and $text -match 'apiClient') {
            $validFiles += $file
        }
    }

    $total = $validDirs.Count + $validFiles.Count
    if ($total -eq 0) { return }

    $i = 0

    # Vẽ thư mục con
    foreach ($dirItem in $validDirs) {
        $i++
        $isLast = ($i -eq $total)
        
        if ($isLast) { $marker = $global:markerLast } else { $marker = $global:markerNotLast }
        Write-Host "${Prefix}${marker}$($dirItem.Name)" -ForegroundColor Cyan
        
        if ($isLast) { $nextPrefix = $Prefix + "    " } else { $nextPrefix = $Prefix + $global:pipeSpace }
        
        # Đệ quy
        Show-ApiTree -Dir $dirItem.FullName -Prefix $nextPrefix
    }

    # Vẽ file và các API bên trong
    foreach ($file in $validFiles) {
        $i++
        $isLast = ($i -eq $total)
        
        if ($isLast) { $marker = $global:markerLast } else { $marker = $global:markerNotLast }
        Write-Host "${Prefix}${marker}$($file.Name)" -ForegroundColor White
        
        # Rút trích API
        $elements = @(Extract-ApiCalls -FilePath $file.FullName)
        
        if ($elements.Count -gt 0) {
            if ($isLast) { $elemPrefix = $Prefix + "    " } else { $elemPrefix = $Prefix + $global:pipeSpace }
            $j = 0
            foreach ($elem in $elements) {
                $j++
                if ($j -eq $elements.Count) { $eMarker = $global:eMarkerLast } else { $eMarker = $global:eMarkerNotLast }
                
                # Tô màu theo phương thức HTTP
                if ($elem -cmatch '^\[API\] (GET|POST|PUT|DELETE|PATCH)') {
                    switch ($Matches[1]) {
                        'GET'    { $color = 'Cyan' }
                        'POST'   { $color = 'Green' }
                        'DELETE' { $color = 'Red' }
                        'PUT'    { $color = 'Yellow' }
                        'PATCH'  { $color = 'Magenta' }
                        default  { $color = 'White' }
                    }
                    Write-Host "${elemPrefix}${eMarker}$elem" -ForegroundColor $color
                }
            }
        }
    }
}

# Header
Write-Host ""
Write-Host "  ================================================" -ForegroundColor DarkGray
Write-Host "   GoPRP-FE API Scanner " -ForegroundColor Yellow -NoNewline
Write-Host "(apiClient calls)" -ForegroundColor DarkGray
Write-Host "  ================================================" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Legend: " -NoNewline -ForegroundColor DarkGray
Write-Host "GET " -NoNewline -ForegroundColor Cyan
Write-Host "POST " -NoNewline -ForegroundColor Green
Write-Host "PUT " -NoNewline -ForegroundColor Yellow
Write-Host "PATCH " -NoNewline -ForegroundColor Magenta
Write-Host "DELETE" -ForegroundColor Red
Write-Host ""

Show-ApiTree -Dir $TargetDir -Prefix $StartPrefix

# Footer: Thống kê tổng
Write-Host ""
Write-Host "  ------------------------------------------------" -ForegroundColor DarkGray

# Đếm tổng API
$allTsFiles = Get-ChildItem -Path $TargetDir -Recurse -File -Include "*.ts","*.tsx" -ErrorAction SilentlyContinue
$totalApis = 0
$methodCounts = @{ GET = 0; POST = 0; PUT = 0; DELETE = 0; PATCH = 0 }

foreach ($f in $allTsFiles) {
    $text = Get-Content -Path $f.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if ($text -and $text -match 'apiClient') {
        $apis = @(Extract-ApiCalls -FilePath $f.FullName)
        $totalApis += $apis.Count
        foreach ($api in $apis) {
            if ($api -cmatch '^\[API\] (GET|POST|PUT|DELETE|PATCH)') {
                $methodCounts[$Matches[1]]++
            }
        }
    }
}

Write-Host "  Total: $totalApis API calls" -ForegroundColor White
Write-Host "  " -NoNewline
Write-Host "GET:$($methodCounts['GET']) " -NoNewline -ForegroundColor Cyan
Write-Host "POST:$($methodCounts['POST']) " -NoNewline -ForegroundColor Green
Write-Host "PUT:$($methodCounts['PUT']) " -NoNewline -ForegroundColor Yellow
Write-Host "PATCH:$($methodCounts['PATCH']) " -NoNewline -ForegroundColor Magenta
Write-Host "DELETE:$($methodCounts['DELETE'])" -ForegroundColor Red
Write-Host ""
