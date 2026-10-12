#!/bin/bash
# Utilidades comunes de los scripts de instalación de Arcana (se cargan con `source`).
# shellcheck disable=SC2034
BUNDLE_ID_DEFAULT="com.aaronalbaa.arcana"

say()  { printf '\n\033[1;35m▸ %s\033[0m\n' "$*"; }
ok()   { printf '\033[1;32m✔ %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m! %s\033[0m\n' "$*"; }
die()  { printf '\033[1;31m✘ %s\033[0m\n' "$*" >&2; exit 1; }

need_xcode() {
  command -v xcodebuild >/dev/null 2>&1 || die "No encuentro Xcode. Instálalo desde la App Store y ábrelo una vez."
  xcode-select -p >/dev/null 2>&1 || die "Ejecuta: sudo xcode-select -s /Applications/Xcode.app/Contents/Developer"
  if ! xcodebuild -version >/dev/null 2>&1; then
    warn "Xcode necesita terminar su configuración. Ejecuta una vez:  sudo xcodebuild -license accept  y  sudo xcodebuild -runFirstLaunch"
    die "Xcode aún no está listo."
  fi
}

# Team ID de desarrollo (10 caracteres): 1) variable TEAM, 2) certificado «Apple Development» del llavero, 3) preferencias de Xcode.
team_from_pem() { openssl x509 -noout -subject 2>/dev/null | sed -n 's/.*OU *= *\([A-Z0-9]\{10\}\).*/\1/p' | head -1; }
detect_team() {
  if [ -n "${TEAM:-}" ]; then echo "$TEAM"; return 0; fi
  local t="" tmp; tmp=$(mktemp -d "${TMPDIR:-/tmp}/arcana-cert.XXXXXX")
  security find-certificate -a -c "Apple Development" -p 2>/dev/null | awk -v d="$tmp" '/BEGIN CERTIFICATE/{n++} {print > (d "/c" n ".pem")}'
  for f in "$tmp"/c*.pem; do
    [ -f "$f" ] || continue
    t=$(team_from_pem <"$f"); [ -n "$t" ] && break
  done
  rm -rf "$tmp"
  if [ -z "$t" ]; then
    t=$(defaults read com.apple.dt.Xcode IDEProvisioningTeamByIdentifier 2>/dev/null | grep -Eo 'teamID = "?[A-Z0-9]{10}' | head -1 | grep -Eo '[A-Z0-9]{10}$')
  fi
  [ -n "$t" ] && echo "$t"
  return 0
}

# Devuelve «UDID|Nombre» del primer iPhone/iPad conectado por cable o Wi‑Fi, o nada.
detect_device() {
  local json; json=$(mktemp "${TMPDIR:-/tmp}/arcana-dev.XXXXXX")
  xcrun devicectl list devices --json-output "$json" >/dev/null 2>&1 || true
  python3 - "$json" <<'PY' 2>/dev/null
import json, sys
try:
    d = json.load(open(sys.argv[1]))
except Exception:
    sys.exit(0)
for dev in d.get("result", {}).get("devices", []):
    hw = dev.get("hardwareProperties", {}); cp = dev.get("connectionProperties", {}); dp = dev.get("deviceProperties", {})
    if hw.get("platform") not in ("iOS", "iPadOS") and hw.get("deviceType") not in ("iPhone", "iPad"):
        continue
    if cp.get("tunnelState") in ("connected", "available") or cp.get("pairingState") == "paired":
        udid = hw.get("udid") or dev.get("identifier")
        print("%s|%s" % (udid, dp.get("name", "iPhone")))
        break
PY
  rm -f "$json"
}
