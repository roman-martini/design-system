# Crea un repositorio en GitHub via REST API (sin gh CLI ni web).
#
# Requisitos:
#   - Un Personal Access Token con scope `repo` (classic) o permiso
#     "Administration: write" (fine-grained), en la env var GITHUB_TOKEN:
#       $env:GITHUB_TOKEN = "ghp_..."
#     (crear en https://github.com/settings/tokens)
#
# Uso:
#   .\scripts\new-github-repo.ps1 -Name design-system
#   .\scripts\new-github-repo.ps1 -Name design-system -Private
#   .\scripts\new-github-repo.ps1 -Name design-system -Description "..." -SetRemote -Push
#
#   -SetRemote  configura `origin` en el repo git actual
#   -Push       además pushea main (implica -SetRemote)

param(
  [Parameter(Mandatory = $true)] [string]$Name,
  [string]$Description = 'Design system @romanmartinidev — tokens (Style Dictionary) + componentes Angular',
  [switch]$Private,
  [switch]$SetRemote,
  [switch]$Push
)

$ErrorActionPreference = 'Stop'

if (-not $env:GITHUB_TOKEN) {
  Write-Error 'Falta GITHUB_TOKEN. Crear un PAT en https://github.com/settings/tokens y setear: $env:GITHUB_TOKEN = "ghp_..."'
}

$isPrivate = $false
if ($Private) { $isPrivate = $true }

$body = @{
  name        = $Name
  description = $Description
  private     = $isPrivate
  auto_init   = $false
} | ConvertTo-Json

$headers = @{
  Authorization          = "Bearer $env:GITHUB_TOKEN"
  Accept                 = 'application/vnd.github+json'
  'X-GitHub-Api-Version' = '2022-11-28'
}

# TLS 1.2 para Windows PowerShell 5.1
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

Write-Host "Creando repo '$Name' (private=$isPrivate)..."
$repo = Invoke-RestMethod -Method Post -Uri 'https://api.github.com/user/repos' -Headers $headers -Body $body -ContentType 'application/json'

Write-Host ''
Write-Host "Repo creado: $($repo.html_url)"
Write-Host "Clone URL:   $($repo.clone_url)"

if ($SetRemote -or $Push) {
  $existing = git remote 2>$null
  if ($existing -contains 'origin') {
    git remote set-url origin $repo.clone_url
    Write-Host "Remote 'origin' actualizado."
  } else {
    git remote add origin $repo.clone_url
    Write-Host "Remote 'origin' configurado."
  }
}

if ($Push) {
  Write-Host 'Pusheando main...'
  git push -u origin main
  Write-Host 'Listo. Si el repo tiene workflows, ya deberian estar corriendo.'
} elseif (-not $SetRemote) {
  Write-Host ''
  Write-Host 'Siguientes pasos manuales:'
  Write-Host "  git remote add origin $($repo.clone_url)"
  Write-Host '  git push -u origin main'
}
