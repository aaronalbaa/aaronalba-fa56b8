#!/bin/bash
# Compila Arcana y la instala en tu iPhone por cable (o Wi-Fi).
# Uso:  TEAM=ABCDE12345 ./install-ios.sh <UDID-del-iPhone>
#  - TEAM: tu Team ID (Xcode > Settings > Accounts > tu Apple ID > Team ID)
#  - UDID: Xcode > Window > Devices and Simulators > tu iPhone > Identifier
set -euo pipefail
cd "$(dirname "$0")"
: "${TEAM:?Falta TEAM=<tu Team ID>. Mira el README.}"
DEVICE="${1:?Falta el UDID del iPhone. Mira el README.}"
./setup.sh --no-open
xcodebuild -project Arcana.xcodeproj -scheme Arcana -configuration Release \
  -destination "id=$DEVICE" -derivedDataPath build -allowProvisioningUpdates \
  DEVELOPMENT_TEAM="$TEAM" build | tail -n 8
APP="build/Build/Products/Release-iphoneos/Arcana.app"
[ -d "$APP" ] || { echo "No se generó $APP"; exit 1; }
xcrun devicectl device install app --device "$DEVICE" "$APP"
xcrun devicectl device process launch --device "$DEVICE" com.aaronalbaa.arcana || true
echo "Listo. Si iOS dice 'Desarrollador no confiable': Ajustes > General > VPN y gestión de dispositivos > confía en tu Apple ID."
