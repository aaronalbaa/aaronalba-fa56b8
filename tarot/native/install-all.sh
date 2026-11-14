#!/bin/bash
# Instala Arcana en tu Mac (Applications + Dock) y en tu iPhone conectado. Uso:  ./install-all.sh
# Variables opcionales: TEAM=ABCDE12345  UDID=...  SKIP_IOS=1  SKIP_MAC=1
set -uo pipefail
cd "$(dirname "$0")" || exit 1
# shellcheck source=lib.sh
. ./lib.sh
need_xcode
chmod +x ./*.sh 2>/dev/null || true

if [ -z "${SKIP_MAC:-}" ]; then
  say "1/2 · Instalando en este Mac"
  ./install-mac.sh || die "Falló la instalación en el Mac (mira el error de arriba)."
  ok "Arcana está en /Applications y en tu Dock."
fi

if [ -n "${SKIP_IOS:-}" ]; then exit 0; fi

say "2/2 · Instalando en tu iPhone"
DEV=""
for i in 1 2 3 4 5 6; do
  if [ -n "${UDID:-}" ]; then DEV="$UDID|iPhone"; break; fi
  DEV=$(detect_device)
  [ -n "$DEV" ] && break
  if [ "$i" = 1 ]; then
    warn "No veo ningún iPhone. Conéctalo con el cable, desbloquéalo y pulsa «Confiar» si te lo pregunta."
    warn "Además: Ajustes → Privacidad y seguridad → Modo de desarrollador (actívalo y reinicia el iPhone)."
  fi
  printf '   esperando (%s/6)…\r' "$i"; sleep 8
done
[ -n "$DEV" ] || { warn "No se detectó el iPhone. Cuando esté listo, ejecuta:  ./install-ios.sh"; exit 0; }
ok "iPhone detectado: ${DEV#*|}"
./install-ios.sh "${DEV%%|*}" || { warn "La instalación en el iPhone no terminó. Lee el mensaje de arriba (lo más común: iniciar sesión con tu Apple ID en Xcode)."; exit 1; }
ok "Todo listo. Disfruta de Arcana ✨"
