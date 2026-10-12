#!/bin/bash
# Prepara y abre el proyecto de Xcode. Ejecuta:  ./setup.sh
set -euo pipefail
cd "$(dirname "$0")"
chmod +x build-web.sh install-mac.sh install-ios.sh 2>/dev/null || true
if ! xcode-select -p >/dev/null 2>&1; then echo "Necesitas Xcode instalado (App Store)."; exit 1; fi
./build-web.sh
if ! command -v xcodegen >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then brew install xcodegen
  else echo "Instala Homebrew (https://brew.sh) y vuelve a ejecutar, o instala XcodeGen a mano."; exit 1; fi
fi
xcodegen generate
echo "Proyecto listo: Arcana.xcodeproj"
[ "${1:-}" = "--no-open" ] || open Arcana.xcodeproj
