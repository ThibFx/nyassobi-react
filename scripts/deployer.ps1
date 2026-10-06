# Compile le site et le met en ligne sur la Raspberry Pi, depuis un PC Windows.
# Pendant de scripts/deployer.sh (Mac), memes etapes et memes garde-fous.
#
#   .\scripts\deployer.ps1                 # tests, puis deploiement
#   .\scripts\deployer.ps1 -SansTests      # deploiement direct
#   .\scripts\deployer.ps1 -Hote nv-pi     # autre alias SSH
#   .\scripts\deployer.ps1 -BacASable      # copie branchee sur le bac a sable (port 8505)
#   .\scripts\deployer.ps1 -Preprod        # copie branchee sur la pre-production (Tailscale, HTTPS)
#
# Ce fichier reste en ASCII: Windows PowerShell 5.1 lit les scripts sans BOM
# comme de l'ANSI, et les lettres accentuees y casseraient les chaines.

param(
  [string]$Hote = "nv-pi",
  [switch]$SansTests,
  [switch]$BacASable,
  [switch]$Preprod
)

# Pas de mode "Stop": sous PowerShell 5.1, un simple message de git ou de npm
# sur la sortie d'erreur deviendrait une erreur fatale. Chaque commande est
# jugee sur son code de retour ($LASTEXITCODE).
$ErrorActionPreference = "Continue"
$racine = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $racine

function Etape([string]$texte) { Write-Host "`n### $texte" -ForegroundColor Cyan }
function Echec([string]$texte) { Write-Host "ECHEC: $texte" -ForegroundColor Red; exit 1 }

$branche = (git rev-parse --abbrev-ref HEAD).Trim()

Etape "Verifications ($branche vers $Hote)"
$enCours = git status --porcelain
if ($enCours) {
  git status --short
  Echec "des modifications ne sont pas validees (git commit). On ne deploie que du code valide."
}

# Ce qui n'est pas pousse n'existe que sur ce PC: l'autre machine ne le verrait pas.
$amont = (git for-each-ref --format="%(upstream:short)" "refs/heads/$branche" | Out-String).Trim()
if (-not $amont) { Echec "la branche $branche n'a jamais ete poussee. Lancer: git push -u origin $branche" }
git fetch -q origin 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { Echec "GitHub injoignable (git fetch)." }
$enRetard = [int](git rev-list --count "HEAD..$amont")
$enAvance = [int](git rev-list --count "$amont..HEAD")
if ($enRetard -gt 0) { Echec "$enRetard commit(s) sur GitHub absents d'ici (travail fait sur l'autre PC ?). Lancer: git pull" }
if ($enAvance -gt 0) { Echec "$enAvance commit(s) pas encore pousses. Lancer: git push" }
Write-Host "  a jour avec $amont"

$majeure = [int]((node -p "process.versions.node.split('.')[0]") | Out-String).Trim()
if ($majeure -lt 22) { Echec "Node $majeure installe, il faut Node 22 ou plus (https://nodejs.org)." }

Etape "Dependances"
npm ci --no-audit --no-fund --silent
if ($LASTEXITCODE -ne 0) { Echec "npm ci" }

# Ce code n'a pas encore de tests automatiques : la compilation (avec la
# verification des types) sert de controle.

Etape "Compilation"
# La Pi sert en HTTP : la redirection vers HTTPS du site est coupee.
$env:VITE_SANS_HTTPS = "1"
if ($BacASable) {
  # Contenus lus sur le vrai WordPress, envois vers celui du bac a sable.
  $env:VITE_WRITE_GRAPHQL_URL = "/bac-a-sable-graphql"
  $env:VITE_BAC_A_SABLE = "1"
}
if ($Preprod) {
  $env:VITE_WRITE_GRAPHQL_URL = "/preprod-graphql"
  $env:VITE_ENVIRONNEMENT = "preprod"
}
npm run --silent build
$codeCompilation = $LASTEXITCODE
Remove-Item Env:VITE_WRITE_GRAPHQL_URL -ErrorAction SilentlyContinue
Remove-Item Env:VITE_BAC_A_SABLE -ErrorAction SilentlyContinue
Remove-Item Env:VITE_ENVIRONNEMENT -ErrorAction SilentlyContinue
Remove-Item Env:VITE_SANS_HTTPS -ErrorAction SilentlyContinue
# tsc reecrit ces fichiers suivis par Git a chaque compilation : on les remet en etat.
git checkout -- tsconfig.app.tsbuildinfo tsconfig.node.tsbuildinfo 2>$null
if ($codeCompilation -ne 0) { Echec "compilation" }

Etape "Envoi sur la Pi"
$archive = Join-Path $env:TEMP "nyassobi-site.tgz"
# tar est fourni avec Windows 10 et 11.
tar -czf $archive -C dist .
if ($LASTEXITCODE -ne 0) { Echec "archive" }
scp -q $archive "${Hote}:/tmp/nyassobi-site.tgz"
if ($LASTEXITCODE -ne 0) { Echec "copie vers $Hote (acces SSH ?)" }
scp -q "deploy/compose.yml" "${Hote}:/tmp/nyassobi-site-compose.yml"
scp -q "deploy/nginx.conf" "${Hote}:/tmp/nyassobi-site-nginx.conf"
scp -q "scripts/deployer-pi.sh" "${Hote}:/tmp/nyassobi-site-deployer.sh"
if ($LASTEXITCODE -ne 0) { Echec "copie des fichiers de deploiement" }
Remove-Item $archive

Etape "Mise en ligne"
$version = (git rev-parse --short HEAD).Trim()
if ($Preprod) {
  ssh $Hote "NYASSOBI_SITE_DIR=`$HOME/nyassobi-preprod bash /tmp/nyassobi-site-deployer.sh /tmp/nyassobi-site.tgz $version preprod"
  if ($LASTEXITCODE -ne 0) { Echec "mise en ligne sur la Pi" }
  Write-Host "`nPre-production : https://<nom Tailscale de nv-pi>" -ForegroundColor Green
  exit 0
}
if ($BacASable) {
  ssh $Hote "NYASSOBI_SITE_DIR=`$HOME/nyassobi-bac-a-sable bash /tmp/nyassobi-site-deployer.sh /tmp/nyassobi-site.tgz $version bac-a-sable"
  if ($LASTEXITCODE -ne 0) { Echec "mise en ligne sur la Pi" }
  Write-Host "`nBac a sable: http://nv-pi:8505" -ForegroundColor Green
  exit 0
}
ssh $Hote "bash /tmp/nyassobi-site-deployer.sh /tmp/nyassobi-site.tgz $version"
if ($LASTEXITCODE -ne 0) { Echec "mise en ligne sur la Pi" }
Write-Host "`nEn ligne: http://nv-pi:8503" -ForegroundColor Green
