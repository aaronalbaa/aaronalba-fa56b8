#!/bin/bash
# Copia la web de Arcana (la carpeta de arriba) dentro del proyecto para empaquetarla en la app.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SRC="$(cd "$HERE/.." && pwd)"
DST="$HERE/Web"
mkdir -p "$DST"
rsync -a --delete \
  --exclude 'native/' --exclude '*.md' --exclude 'sw.js' --exclude '.DS_Store' \
  "$SRC"/ "$DST"/
echo "Web sincronizada ($(ls "$DST" | wc -l | tr -d ' ') archivos)"
