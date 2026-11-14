#!/bin/bash
# Copia la web de Arcana (la carpeta de arriba) dentro del proyecto para empaquetarla en la app.
# Solo usa tar (viene con macOS y Linux); no depende de rsync.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SRC="$(cd "$HERE/.." && pwd)"
DST="$HERE/Web"
rm -rf "$DST"
mkdir -p "$DST"
(cd "$SRC" && tar --exclude='./native' --exclude='./backend' --exclude='*.md' --exclude='./sw.js' --exclude='.DS_Store' -cf - .) | tar -C "$DST" -xf -
echo "Web sincronizada ($(find "$DST" -mindepth 1 -maxdepth 1 | wc -l | tr -d ' ') archivos)"
