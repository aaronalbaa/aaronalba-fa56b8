#!/bin/bash
# Compila Arcana para tu Mac, la copia a /Applications y la fija en el Dock.  Uso:  ./install-mac.sh
set -uo pipefail
cd "$(dirname "$0")" || exit 1
# shellcheck source=lib.sh
. ./lib.sh
need_xcode
./setup.sh --no-open || die "No se pudo generar el proyecto."
mkdir -p build
say "Compilando para el Mac…"
xcodebuild -project Arcana.xcodeproj -scheme ArcanaMac -configuration Release -derivedDataPath build \
  CODE_SIGN_IDENTITY=- build 2>&1 | tee build/mac-build.log | tail -n 8
[ "${PIPESTATUS[0]}" = 0 ] || die "Falló la compilación del Mac. Revisa build/mac-build.log"
APP="build/Build/Products/Release/Arcana.app"
[ -d "$APP" ] || die "No se generó $APP"
osascript -e 'tell application "Arcana" to quit' >/dev/null 2>&1 || true
sleep 1
rm -rf /Applications/Arcana.app 2>/dev/null || sudo rm -rf /Applications/Arcana.app
cp -R "$APP" /Applications/Arcana.app 2>/dev/null || sudo cp -R "$APP" /Applications/Arcana.app
xattr -dr com.apple.quarantine /Applications/Arcana.app 2>/dev/null || true
if defaults read com.apple.dock persistent-apps 2>/dev/null | grep -q "Arcana.app"; then
  ok "Arcana ya estaba en el Dock."
else
  defaults write com.apple.dock persistent-apps -array-add '<dict><key>tile-data</key><dict><key>file-data</key><dict><key>_CFURLString</key><string>/Applications/Arcana.app</string><key>_CFURLStringType</key><integer>0</integer></dict></dict></dict>'
  killall Dock
  ok "Arcana fijada en el Dock."
fi
open /Applications/Arcana.app
