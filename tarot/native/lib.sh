#!/bin/bash
# Utilidades comunes de los scripts de instalación de Arcana (se cargan con `source`).
# shellcheck disable=SC2034
BUNDLE_ID_DEFAULT="com.aaronalbaa.arcana"

say()  { printf '\n\033[1;35m▸ %s\033[0m\n' "$*"; }
ok()   { printf '\033[1;32m✔ %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m! %s\033[0m\n' "$*"; }
die()  { printf '\033[1;31m✘ %s\033[0m\n' "$*" >&2; exit 1; }

need_xcode() {
  # Xcode instalado pero xcode-select apuntando a las Command Line Tools: usamos Xcode sin necesitar sudo.
  case "$(xcode-select -p 2>/dev/null)" in
    *.app/Contents/Developer) ;;
    *) local x
       for x in /Applications/Xcode.app /Applications/Xcode*.app; do
         if [ -d "$x/Contents/Developer" ]; then export DEVELOPER_DIR="$x/Contents/Developer"; break; fi
       done ;;
  esac
  command -v xcodebuild >/dev/null 2>&1 || die "No encuentro Xcode. Instálalo desde la App Store y ábrelo una vez."
  local err
  if ! err=$(xcodebuild -version 2>&1); then
    case "$err" in
      *"command line tools"*) die "Xcode no está seleccionado. Ejecuta:  sudo xcode-select -s /Applications/Xcode.app/Contents/Developer" ;;
      *) warn "Xcode necesita terminar su configuración. Ejecuta una vez:  sudo xcodebuild -license accept  y  sudo xcodebuild -runFirstLaunch"
         die "Xcode aún no está listo." ;;
    esac
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

# Devuelve «UDID|Nombre» del iPhone (mejor) o iPad conectado ahora mismo, o nada.
detect_device() {
  local json; json=$(mktemp "${TMPDIR:-/tmp}/arcana-dev.XXXXXX")
  xcrun devicectl list devices --json-output "$json" >/dev/null 2>&1 || true
  python3 - "$json" <<'PY' 2>/dev/null
import json, sys
try:
    d = json.load(open(sys.argv[1]))
except Exception:
    sys.exit(0)
best = None
for dev in d.get("result", {}).get("devices", []):
    hw = dev.get("hardwareProperties", {}); cp = dev.get("connectionProperties", {}); dp = dev.get("deviceProperties", {})
    if hw.get("platform") not in ("iOS", "iPadOS") and hw.get("deviceType") not in ("iPhone", "iPad"):
        continue
    ts = cp.get("tunnelState")
    if ts == "connected":
        rank = 0
    elif ts != "unavailable" and cp.get("transportType") == "wired" and cp.get("pairingState") == "paired":
        rank = 2  # recién enchufado por cable: aún sin túnel
    else:
        continue
    if hw.get("deviceType") != "iPhone":
        rank += 1
    udid = hw.get("udid") or dev.get("identifier")
    if udid and (best is None or rank < best[0]):
        best = (rank, "%s|%s" % (udid, dp.get("name", "iPhone")))
if best:
    print(best[1])
PY
  rm -f "$json"
}

# Si un xcodebuild falla: muestra los errores reales y una pista concreta en español.
explain_build_failure() {
  local log="$1"
  printf '\n'
  grep -E 'error:' "$log" 2>/dev/null | sort -u | head -n 8
  if   grep -qE 'No Accounts|No account for team|no team' "$log" 2>/dev/null; then warn "Abre Xcode → Settings → Accounts e inicia sesión con tu Apple ID; luego repite."
  elif grep -qiE 'Developer Mode' "$log" 2>/dev/null; then warn "Activa el Modo de desarrollador en el iPhone (Ajustes → Privacidad y seguridad) y reinícialo."
  elif grep -qiE 'locked|passcode' "$log" 2>/dev/null; then warn "Desbloquea el iPhone y vuelve a ejecutar."
  elif grep -qE 'has no devices|No profiles' "$log" 2>/dev/null; then warn "Conecta y desbloquea el iPhone, pulsa «Confiar» y repite."
  fi
}
