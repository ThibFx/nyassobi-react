#!/bin/bash
# Installe une version compilée du site sur la Raspberry Pi.
#
# Lancé par scripts/deployer.sh (Mac) ou scripts/deployer.ps1 (Windows), qui
# compilent le site et envoient ici l'archive, compose.yml et nginx.conf.
#
#   bash deployer-pi.sh /tmp/nyassobi-site.tgz <commit>
set -euo pipefail

ARCHIVE="${1:?archive du site attendue}"
VERSION="${2:-inconnue}"
DOSSIER="${NYASSOBI_SITE_DIR:-$HOME/nyassobi-site}"
GARDER=3

mkdir -p "$DOSSIER/www/releases"
cp /tmp/nyassobi-site-compose.yml "$DOSSIER/compose.yml"
cp /tmp/nyassobi-site-nginx.conf "$DOSSIER/nginx.conf"

NOM="$(date +%Y%m%d-%H%M%S)-$VERSION"
CIBLE="$DOSSIER/www/releases/$NOM"
mkdir -p "$CIBLE"
tar -xzf "$ARCHIVE" -C "$CIBLE"
[ -f "$CIBLE/index.html" ] || { echo "archive sans index.html"; rm -rf "$CIBLE"; exit 1; }
rm -f "$ARCHIVE"

# Bascule atomique : le lien est relatif pour rester valable dans le conteneur.
ln -sfn "releases/$NOM" "$DOSSIER/www/current.nouveau"
mv -Tf "$DOSSIER/www/current.nouveau" "$DOSSIER/www/current"
echo "### Version en ligne : $NOM"

cd "$DOSSIER"
docker compose up -d 2>&1 | tail -3
# nginx relit sa configuration au cas où nginx.conf aurait changé.
docker compose exec -T site nginx -s reload >/dev/null 2>&1 || true

# Les anciennes versions servent à revenir en arrière ; trois suffisent.
ls -1d www/releases/*/ | sort | head -n -"$GARDER" | xargs -r rm -rf

for i in $(seq 1 15); do
  if curl -fsS -o /dev/null http://localhost:8503/; then
    echo "### Site prêt"
    exit 0
  fi
  sleep 2
done
echo "Le site ne répond pas sur le port 8503 :"
docker compose logs --tail 20 site
exit 1
