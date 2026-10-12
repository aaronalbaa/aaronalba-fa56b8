#!/bin/bash
# Compila Arcana y la instala en tu iPhone por cable (o Wi‑Fi). Uso:  ./install-ios.sh [UDID]
# Detecta solo el iPhone y tu Team ID; puedes forzarlos con UDID=... y TEAM=...
set -uo pipefail
cd "$(dirname "$0")" || exit 1
# shellcheck source=lib.sh
. ./lib.sh
need_xcode

DEVICE="${1:-${UDID:-}}"
if [ -z "$DEVICE" ]; then
  D=$(detect_device); [ -n "$D" ] || die "No encuentro ningún iPhone conectado. Conéctalo, desbloquéalo y confía en el ordenador."
  DEVICE="${D%%|*}"; ok "iPhone: ${D#*|}"
fi

TEAM_ID=$(detect_team)
if [ -z "$TEAM_ID" ]; then
  warn "No pude detectar tu Team ID automáticamente."
  warn "Abre Xcode → Settings → Accounts, inicia sesión con tu Apple ID, y pulsa «Manage Certificates» → ＋ → Apple Development."
  printf 'O escribe tu Team ID (10 caracteres, visible en Accounts) y pulsa Enter: '
  read -r TEAM_ID </dev/tty
  [ -n "$TEAM_ID" ] || die "Falta el Team ID."
fi
ok "Team ID: $TEAM_ID"

./setup.sh --no-open || die "No se pudo generar el proyecto."

build_ios() {
  xcodebuild -project Arcana.xcodeproj -scheme Arcana -configuration Release \
    -destination "id=$DEVICE" -derivedDataPath build -allowProvisioningUpdates \
    DEVELOPMENT_TEAM="$TEAM_ID" PRODUCT_BUNDLE_IDENTIFIER="$1" build 2>&1 | tee build/ios-build.log | tail -n 15
  return "${PIPESTATUS[0]}"
}
mkdir -p build
BUNDLE="${BUNDLE_ID:-$BUNDLE_ID_DEFAULT}"
say "Compilando para el iPhone (la primera vez tarda unos minutos)…"
if ! build_ios "$BUNDLE"; then
  if grep -qiE "Failed Registering Bundle Identifier|not available|already exists|Bundle Identifier" build/ios-build.log; then
    BUNDLE="$BUNDLE_ID_DEFAULT.$(LC_ALL=C tr -dc 'a-z0-9' </dev/urandom | head -c 5)"
    warn "El identificador está ocupado; pruebo con $BUNDLE"
    build_ios "$BUNDLE" || die "No se pudo compilar para el iPhone. Revisa build/ios-build.log"
  else
    die "No se pudo compilar para el iPhone. Revisa build/ios-build.log"
  fi
fi

APP="build/Build/Products/Release-iphoneos/Arcana.app"
[ -d "$APP" ] || die "No se generó $APP"
say "Instalando en el iPhone…"
xcrun devicectl device install app --device "$DEVICE" "$APP" || die "No se pudo instalar. ¿Está desbloqueado el iPhone y con el Modo de desarrollador activo?"
xcrun devicectl device process launch --device "$DEVICE" "$BUNDLE" || warn "Instalada, pero no pude abrirla: ábrela tú desde la pantalla de inicio."
ok "Arcana instalada en el iPhone."
warn "Si iOS dice «Desarrollador no confiable»: Ajustes → General → VPN y gestión de dispositivos → tu Apple ID → Confiar."
