# ============================================================================
# 📊 FE API Coverage — Kiểm tra mức độ bao phủ API trong E2E Tests
# ============================================================================
# Cách dùng: .\fe-api-coverage.ps1
# ============================================================================

param([string]$SrcDir = 'src', [string]$TestDir = 'tests\e2e')

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# --- KÝ TỰ VẼ BẢNG ---
$charTick = [char]0x2705 # ✅
$charCross = [char]0x274C # ❌

# --- FUNCTION 1: TRÍCH XUẤT API TỪ SOURCE ---
function Get-SourceApis {
    param([string]$Dir)
    $results = @{}
    $files = Get-ChildItem -Path $Dir -Recurse -File | Where-Object { $_.Extension -match '^\.(ts|tsx)$' }
    
    foreach ($f in $files) {
        $lines = Get-Content -Path $f.FullName -Encoding UTF8
        for ($idx = 0; $idx -lt $lines.Count; $idx++) {
            $line = $lines[$idx]
            $apiPattern = [regex]::new('apiClient[^(]*\(\s*[`''"](/?[^`''"]+)[`''"]')
            $m = $apiPattern.Match($line)
            if ($m.Success) {
                $endpoint = $m.Groups[1].Value -replace '\$\{[^}]+\}', ':id' -replace '\?.*$', ''
                if (-not $endpoint.StartsWith('/')) { continue }
                
                $method = 'GET'
                $searchEnd = [Math]::Min($idx + 5, $lines.Count - 1)
                for ($j = $idx; $j -le $searchEnd; $j++) {
                    if ($lines[$j] -match 'method:\s*\W(\w+)\W') {
                        $method = $Matches[1].ToUpper()
                        break
                    }
                }
                $key = "$method $endpoint"
                $results[$key] = @{ Method = $method; Endpoint = $endpoint; File = $f.Name }
            }
        }
    }
    return $results
}

# --- FUNCTION 2: TRÍCH XUẤT API ĐÃ TEST TỪ E2E SPECS ---
function Get-TestedApis {
    param([string]$Dir)
    $tested = @{}
    $files = Get-ChildItem -Path $Dir -Recurse -File -Include "*.spec.ts"
    
    foreach ($f in $files) {
        $content = Get-Content -Path $f.FullName -Raw -Encoding UTF8
        # Pattern chuẩn Section 5: includes('/path') và method() === 'METHOD'
        $pattern = 'url\(\)\.includes\([''"]([^''"]+)[''"]\).*?method\(\)\s*===\s*[''"](\w+)[''"]|method\(\)\s*===\s*[''"](\w+)[''"].*?url\(\)\.includes\([''"]([^''"]+)[''"]\)'
        $matches = [regex]::Matches($content, $pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)
        
        foreach ($m in $matches) {
            $endpoint = if ($m.Groups[1].Value) { $m.Groups[1].Value } else { $m.Groups[4].Value }
            $method = if ($m.Groups[2].Value) { $m.Groups[2].Value.ToUpper() } else { $m.Groups[3].Value.ToUpper() }
            
            $key = "$method $endpoint"
            if (-not $tested.ContainsKey($key)) { $tested[$key] = @() }
            $tested[$key] += $f.Name
        }
    }
    return $tested
}

# --- THỰC THI ---
Write-Host "`n  ================================================" -ForegroundColor DarkGray
Write-Host "   GoPRP-FE API Test Coverage Report" -ForegroundColor Yellow
Write-Host "  ================================================" -ForegroundColor DarkGray
Write-Host ""

$sourceApis = Get-SourceApis -Dir $SrcDir
$testedApis = Get-TestedApis -Dir $TestDir

$allKeys = $sourceApis.Keys | Sort-Object
$countTested = 0

Write-Host "  STATUS  | METHOD | ENDPOINT" -ForegroundColor White
Write-Host "  --------|--------|------------------------------" -ForegroundColor DarkGray

foreach ($key in $allKeys) {
    $api = $sourceApis[$key]
    $isTested = $false
    
    # So khớp linh hoạt (Fuzzy Match)
    foreach ($tKey in $testedApis.Keys) {
        $tMethod = $tKey.Split(' ')[0]
        $tPath = $tKey.Split(' ')[1]
        
        if ($tMethod -eq $api.Method) {
            # Nếu path trong test là một phần của path trong source (VD: /users nằm trong /users/:id)
            if ($api.Endpoint.Contains($tPath) -or $tPath.Contains($api.Endpoint)) {
                $isTested = $true
                break
            }
        }
    }
    
    if ($isTested) {
        $status = "$charTick Tested  "
        $color = "Green"
        $countTested++
    } else {
        $status = "$charCross Missing "
        $color = "Red"
    }
    
    $methodStr = $api.Method.PadRight(6)
    Write-Host "  $status | $methodStr | $($api.Endpoint)" -ForegroundColor $color
}

# --- TỔNG KẾT ---
$total = $sourceApis.Count
$percent = if ($total -gt 0) { [Math]::Round(($countTested / $total) * 100, 1) } else { 0 }
$summaryColor = if ($percent -gt 80) { "Green" } elseif ($percent -gt 50) { "Yellow" } else { "Red" }

Write-Host ""
Write-Host "  ------------------------------------------------" -ForegroundColor DarkGray
Write-Host "  Summary:" -ForegroundColor White
Write-Host "  - Total APIs defined in source: $total"
Write-Host "  - APIs covered by E2E tests:   $countTested"
Write-Host "  - Coverage Percentage:         " -NoNewline
Write-Host "$percent%" -ForegroundColor $summaryColor
Write-Host ""
