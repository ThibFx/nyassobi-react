#!/bin/bash
# Installe une version compilée du site sur la Raspberry Pi.
#
# Lancé par scripts/deployer.sh (Mac) ou scripts/deployer.ps1 (Windows), qui
# compilent le site et envoient ici l'archive, compose.yml et nginx.conf.
#
#   bash deployer-pi.sh /tmp/nyassobi-site.tgz <commit>              # version de travail (8503)
#   bash deployer-pi.sh /tmp/nyassobi-site.tgz <commit> bac-a-sable  # copie du bac à sable (8505)
set -euo pipefail

ARCHIVE="${1:?archive du site attendue}"
VERSION="${2:-inconnue}"
MODE="${3:-travail}"
DOSSIER="${NYASSOBI_SITE_DIR:-$HOME/nyassobi-site}"
PORT=8503
GARDER=3

mkdir -p "$DOSSIER/www/releases"
if [ "$MODE" = "bac-a-sable" ]; then
  # Le nginx du bac à sable est décrit dans le dépôt du plugin : on n'y touche pas.
  PORT=8505
  [ -f "$DOSSIER/compose.yml" ] || { echo "bac à sable absent : lancer d'abord scripts/bac-a-sable.sh du dépôt du plugin"; exit 1; }
else
  cp /tmp/nyassobi-site-compose.yml "$DOSSIER/compose.yml"
  cp /tmp/nyassobi-site-nginx.conf "$DOSSIER/nginx.conf"
fi

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
docker compose up -d site 2>&1 | tail -3
# nginx relit sa configuration au cas où nginx.conf aurait changé.
docker compose exec -T site nginx -s reload >/dev/null 2>&1 || true

# Les anciennes versions servent à revenir en arrière ; trois suffisent.
ls -1d www/releases/*/ | sort | head -n -"$GARDER" | xargs -r rm -rf

for i in $(seq 1 15); do
  if curl -fsS -o /dev/null "http://localhost:$PORT/"; then
    echo "### Site prêt"
    exit 0
  fi
  sleep 2
done
echo "Le site ne répond pas sur le port $PORT :"
docker compose logs --tail 20 site
exit 1
