#!/bin/bash
# Compile le site et le met en ligne sur la Raspberry Pi, depuis un Mac ou un Linux.
# Pendant de scripts/deployer.ps1 (Windows), mêmes étapes et mêmes garde-fous.
#
#   ./scripts/deployer.sh               # tests, puis déploiement
#   ./scripts/deployer.sh --sans-tests  # déploiement direct
#   ./scripts/deployer.sh --bac-a-sable # copie branchée sur le bac à sable (port 8505)
#   HOTE=autre-alias ./scripts/deployer.sh
#
# L'alias SSH `nv-pi` doit mener à la Pi ; par Tailscale, cela marche depuis
# n'importe quel réseau.
set -uo pipefail

HOTE="${HOTE:-nv-pi}"
SANS_TESTS=0
BAC_A_SABLE=0
for argument in "$@"; do
  case "$argument" in
    --sans-tests) SANS_TESTS=1 ;;
    --bac-a-sable) BAC_A_SABLE=1 ;;
  esac
done

cd "$(dirname "$0")/.."

etape() { printf '\n\033[36m### %s\033[0m\n' "$1"; }
echec() { printf '\033[31mECHEC: %s\033[0m\n' "$1"; exit 1; }

BRANCHE="$(git rev-parse --abbrev-ref HEAD)"

etape "Vérifications ($BRANCHE vers $HOTE)"
if [ -n "$(git status --porcelain)" ]; then
  git status --short
  echec "des modifications ne sont pas validées (git commit). On ne déploie que du code validé."
fi

# Ce qui n'est pas poussé n'existe que sur ce poste : l'autre PC ne le verrait pas.
AMONT="$(git for-each-ref --format='%(upstream:short)' "refs/heads/$BRANCHE")"
[ -n "$AMONT" ] || echec "la branche $BRANCHE n'a jamais été poussée. Lancer : git push -u origin $BRANCHE"
git fetch -q origin || echec "GitHub injoignable (git fetch)."
EN_RETARD="$(git rev-list --count "HEAD..$AMONT")"
EN_AVANCE="$(git rev-list --count "$AMONT..HEAD")"
[ "$EN_RETARD" -eq 0 ] || echec "$EN_RETARD commit(s) sur GitHub absents d'ici (travail fait sur l'autre PC ?). Lancer : git pull"
[ "$EN_AVANCE" -eq 0 ] || echec "$EN_AVANCE commit(s) pas encore poussés. Lancer : git push"
echo "  à jour avec $AMONT"

# Vite 8 et les tests (jsdom) demandent Node 22 ou plus : on prend la version
# nvm la plus récente si celle du PATH est trop ancienne.
if [ "$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)" -lt 22 ] && [ -d "$HOME/.nvm/versions/node" ]; then
  RECENT="$(ls "$HOME/.nvm/versions/node" | sort -V | tail -1)"
  export PATH="$HOME/.nvm/versions/node/$RECENT/bin:$PATH"
fi

etape "Dépendances"
npm ci --no-audit --no-fund --silent || echec "npm ci"

# Ce code n'a pas encore de tests automatiques : la compilation (avec la
# vérification des types) sert de contrôle. --sans-tests est accepté pour
# garder les mêmes commandes que sur la branche refonte.

etape "Compilation"
# La Pi sert en HTTP : la redirection vers HTTPS du site est coupée.
export VITE_SANS_HTTPS=1
if [ "$BAC_A_SABLE" -eq 1 ]; then
  # Contenus lus sur le vrai WordPress, envois vers celui du bac à sable
  # (relayé par le nginx du bac à sable, voir le dépôt du plugin).
  VITE_WRITE_GRAPHQL_URL=/bac-a-sable-graphql VITE_BAC_A_SABLE=1 npm run --silent build || echec "compilation"
else
  npm run --silent build || echec "compilation"
fi

etape "Envoi sur la Pi"
ARCHIVE="$(mktemp -d)/nyassobi-site.tgz"
# Sans les attributs étendus de macOS, que tar sur la Pi signalerait un par un.
COPYFILE_DISABLE=1 tar --no-xattrs --no-mac-metadata -czf "$ARCHIVE" -C dist . 2>/dev/null \
  || tar -czf "$ARCHIVE" -C dist . || echec "archive"
scp -q "$ARCHIVE" "$HOTE:/tmp/nyassobi-site.tgz" \
  && scp -q deploy/compose.yml "$HOTE:/tmp/nyassobi-site-compose.yml" \
  && scp -q deploy/nginx.conf "$HOTE:/tmp/nyassobi-site-nginx.conf" \
  && scp -q scripts/deployer-pi.sh "$HOTE:/tmp/nyassobi-site-deployer.sh" \
  || echec "copie vers $HOTE (accès SSH ?)"
rm -f "$ARCHIVE"

etape "Mise en ligne"
if [ "$BAC_A_SABLE" -eq 1 ]; then
  ssh "$HOTE" "NYASSOBI_SITE_DIR=\$HOME/nyassobi-bac-a-sable bash /tmp/nyassobi-site-deployer.sh /tmp/nyassobi-site.tgz $(git rev-parse --short HEAD) bac-a-sable" || echec "mise en ligne sur la Pi"
  printf '\n\033[32mBac à sable : http://nv-pi:8505 (Tailscale : http://nv-pi:8505)\033[0m\n'
  exit 0
fi
ssh "$HOTE" "bash /tmp/nyassobi-site-deployer.sh /tmp/nyassobi-site.tgz $(git rev-parse --short HEAD)" || echec "mise en ligne sur la Pi"
printf '\n\033[32mEn ligne : http://nv-pi:8503 (Tailscale : http://nv-pi:8503)\033[0m\n'
