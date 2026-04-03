# Stops whatever process is listening on port 5000 (usually a duplicate Node API).
$ErrorActionPreference = 'SilentlyContinue'
$conn = Get-NetTCPConnection -LocalPort 5000 -State Listen | Select-Object -First 1
if ($conn) {
  Stop-Process -Id $conn.OwningProcess -Force
  Write-Host "Stopped PID $($conn.OwningProcess) on port 5000."
} else {
  Write-Host "No process is listening on port 5000."
}
