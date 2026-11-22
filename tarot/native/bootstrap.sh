#!/bin/bash
# Instalador de una línea. En el Terminal de tu Mac:
#   curl -fsSL https://raw.githubusercontent.com/aaronalbaa/aaronalba-fa56b8/main/tarot/native/bootstrap.sh | bash
# Todo el script va dentro de main() para que bash lo lea entero antes de ejecutarlo (con `curl | bash`
# la entrada estándar es el propio script).
main() {
  set -euo pipefail
  local REPO="https://github.com/aaronalbaa/aaronalba-fa56b8.git"
  local BRANCH="${ARCANA_BRANCH:-main}"
  local DEST="${ARCANA_DIR:-$HOME/Arcana}"
  command -v git >/dev/null 2>&1 || { echo "Falta git: ejecuta  xcode-select --install"; exit 1; }
  if [ -d "$DEST/.git" ]; then
    echo "▸ Actualizando $DEST"
    git -C "$DEST" fetch --depth 1 origin "$BRANCH"
    git -C "$DEST" checkout -q -B "$BRANCH" "origin/$BRANCH"
  else
    echo "▸ Descargando Arcana en $DEST"
    git clone --depth 1 --filter=blob:none --sparse --branch "$BRANCH" "$REPO" "$DEST"
    git -C "$DEST" sparse-checkout set tarot
  fi
  [ -d "$DEST/tarot/native" ] || { echo "La rama $BRANCH no contiene tarot/native."; exit 1; }
  cd "$DEST/tarot/native"
  chmod +x ./*.sh
  # con «curl | bash» la entrada estándar es la tubería: el instalador recupera el teclado para poder preguntar
  if [ ! -t 0 ] && { : </dev/tty; } 2>/dev/null; then exec ./install-all.sh </dev/tty; fi
  exec ./install-all.sh
}
main "$@"
