#!/bin/bash
# Compila Arcana para tu Mac, la copia a /Applications y la fija en el Dock.  Ejecuta:  ./install-mac.sh
set -euo pipefail
cd "$(dirname "$0")"
./setup.sh --no-open
xcodebuild -project Arcana.xcodeproj -scheme ArcanaMac -configuration Release -derivedDataPath build CODE_SIGN_IDENTITY=- build | tail -n 5
APP="build/Build/Products/Release/Arcana.app"
[ -d "$APP" ] || { echo "No se generó $APP"; exit 1; }
osascript -e 'tell application "Arcana" to quit' >/dev/null 2>&1 || true
rm -rf /Applications/Arcana.app
cp -R "$APP" /Applications/Arcana.app
xattr -dr com.apple.quarantine /Applications/Arcana.app 2>/dev/null || true
if defaults read com.apple.dock persistent-apps 2>/dev/null | grep -q "Arcana.app"; then
  echo "Arcana ya está en el Dock."
else
  defaults write com.apple.dock persistent-apps -array-add '<dict><key>tile-data</key><dict><key>file-data</key><dict><key>_CFURLString</key><string>/Applications/Arcana.app</string><key>_CFURLStringType</key><integer>0</integer></dict></dict></dict>'
  killall Dock
  echo "Arcana fijada en el Dock."
fi
open /Applications/Arcana.app
