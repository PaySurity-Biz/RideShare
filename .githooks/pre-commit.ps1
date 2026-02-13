$ErrorActionPreference = "Stop"

# Block accidental commits of local artifact/review folders
$blockedPrefixes = @(
  "_ebt_artifacts_",
  "_review_from_ebt_",
  "RideShare_Artifacts"
)

$out = & git diff --cached --name-only --diff-filter=ACMR 2>$null | Out-String
if (-not $out) { exit 0 }

$lines = $out -split "
" | ForEach-Object { $_.Trim("") } | Where-Object { $_.Length -gt 0 }

$bad = @()
foreach ($p in $lines) {
  foreach ($bp in $blockedPrefixes) {
    if ($p.StartsWith($bp)) { $bad += $p }
  }
}

if ($bad.Count -gt 0) {
  Write-Host ""
  Write-Host "BLOCKED: local artifacts/review folders are staged." -ForegroundColor Red
  Write-Host "Unstage them (git reset -- <path>) or delete them, then retry." -ForegroundColor Red
  Write-Host ""
  Write-Host ("Staged forbidden paths:
 - " + ($bad -join "
 - ")) -ForegroundColor Yellow
  exit 1
}

exit 0
