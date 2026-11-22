#!/bin/bash
# Prepara y abre el proyecto de Xcode. Ejecuta:  ./setup.sh
set -euo pipefail
cd "$(dirname "$0")"
chmod +x build-web.sh install-mac.sh install-ios.sh 2>/dev/null || true
if ! xcode-select -p >/dev/null 2>&1; then echo "Necesitas Xcode instalado (App Store)."; exit 1; fi
./build-web.sh
# Homebrew puede no estar en el PATH de un «curl | bash»
for b in /opt/homebrew/bin /usr/local/bin; do [ -x "$b/brew" ] && PATH="$b:$PATH"; done
XG_HOME="$HOME/.arcana/xcodegen"
[ -x "$XG_HOME/bin/xcodegen" ] && PATH="$XG_HOME/bin:$PATH"
if ! command -v xcodegen >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    brew install xcodegen
  else
    # Sin Homebrew: descarga XcodeGen (binario oficial) a una carpeta propia, sin tocar el sistema.
    echo "▸ Descargando XcodeGen…"
    tmp="$(mktemp -d "${TMPDIR:-/tmp}/arcana-xg.XXXXXX")"
    # shellcheck disable=SC2015
    curl -fsSL -o "$tmp/xg.zip" "https://github.com/yonaskolb/XcodeGen/releases/latest/download/xcodegen.zip" \
      && mkdir -p "$HOME/.arcana" && rm -rf "$XG_HOME" && unzip -qo "$tmp/xg.zip" -d "$tmp/x" \
      && mv "$tmp/x/xcodegen" "$XG_HOME" || { rm -rf "$tmp"; echo "No pude instalar XcodeGen. Instala Homebrew (https://brew.sh) y repite."; exit 1; }
    rm -rf "$tmp"
    PATH="$XG_HOME/bin:$PATH"
  fi
fi
xcodegen generate
echo "Proyecto listo: Arcana.xcodeproj"
[ "${1:-}" = "--no-open" ] || open Arcana.xcodeproj
