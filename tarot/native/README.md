# Arcana como app nativa (iPhone, iPad y Mac)

## Instalación con una sola línea (Mac + iPhone)
1. Conecta el iPhone al Mac con el cable, desbloquéalo y pulsa «Confiar». En el iPhone: *Ajustes → Privacidad y seguridad → Modo de desarrollador* (actívalo y reinicia).
2. Abre Xcode una vez, *Settings → Accounts* e inicia sesión con tu Apple ID (gratuito vale).
3. Pega esto en el Terminal del Mac:
```bash
curl -fsSL https://raw.githubusercontent.com/aaronalbaa/aaronalba-fa56b8/main/tarot/native/bootstrap.sh | bash
```
Descarga el proyecto en `~/Arcana`, compila la app del Mac, la copia a **/Applications**, la **fija en el Dock**, detecta tu iPhone y tu Team ID, y la instala también en el iPhone. Si algo falta, el script te dice exactamente qué.

Esta carpeta contiene un proyecto de Xcode listo para generar con **XcodeGen**. La app es un contenedor nativo en Swift/SwiftUI (WKWebView) que lleva dentro **toda la web de Arcana empaquetada**, así que funciona sin conexión (salvo la IA, el clima y la búsqueda de lugares).

Incluye:
- App **iOS/iPadOS** (`Arcana`) y app **macOS** (`ArcanaMac`, ventana sin barra de título, tamaño mínimo 860×620).
- Copia de seguridad automática de tus datos (perfil, memoria, diario, biblioteca…) cada 15 s en un archivo de la app; si el sistema borrase el almacenamiento web, se restaura al abrir.
- Vibración sutil (iOS), descargas y compartir, enlaces externos en el navegador, ubicación y movimiento (péndulo) con sus permisos.

> ⚠️ Este proyecto **no se ha podido compilar en el entorno donde se escribió** (es Linux, sin Xcode). Está escrito siguiendo las APIs de Apple, pero la primera compilación en tu Mac puede pedir algún ajuste menor. Si Xcode muestra un error, cópialo y se corrige en un minuto.

## Requisitos
- Un Mac con **Xcode** (ya lo tienes) y sus herramientas de línea de comandos (`xcode-select --install`).
- **Homebrew** (https://brew.sh) para instalar XcodeGen automáticamente. Sin Homebrew: descarga XcodeGen desde https://github.com/yonaskolb/XcodeGen y ponlo en tu PATH.
- Un **Apple ID** (gratuito basta) iniciado en Xcode: *Xcode → Settings → Accounts*.

## 1) Abrir el proyecto
```bash
git clone https://github.com/aaronalbaa/aaronalba-fa56b8.git
cd aaronalba-fa56b8
git checkout claude/hola-i2epqw      # o main si ya se ha fusionado
cd tarot/native
./setup.sh                           # sincroniza la web, genera Arcana.xcodeproj y lo abre
```

## 2) En el Mac (con Dock)
Opción rápida, un solo comando:
```bash
./install-mac.sh
```
Compila en Release, copia **Arcana.app a /Applications**, la **fija en el Dock** y la abre.

Manual: en Xcode elige el esquema **ArcanaMac** y pulsa ▶. Para fijarla: clic derecho en su icono del Dock → *Opciones → Mantener en el Dock*.

## 3) En tu iPhone
1. En el iPhone: *Ajustes → Privacidad y seguridad → Modo de desarrollador* → activar y reiniciar.
2. Conecta el iPhone al Mac con cable y acepta «Confiar en este ordenador».
3. En Xcode, abre `Arcana.xcodeproj`, selecciona el target **Arcana** → pestaña *Signing & Capabilities* → marca *Automatically manage signing* → elige tu **Team** (tu Apple ID personal).
   - Si dice que el *Bundle Identifier* ya existe, cámbialo por uno único, por ejemplo `com.TUNOMBRE.arcana` (en `project.yml` y en el target).
4. Arriba, elige tu iPhone como destino y pulsa **▶**. La primera vez: en el iPhone, *Ajustes → General → VPN y gestión de dispositivos →* confía en tu Apple ID.

Alternativa por terminal:
```bash
TEAM=TU_TEAM_ID ./install-ios.sh UDID_DE_TU_IPHONE
```
(Team ID: Xcode → Settings → Accounts. UDID: Xcode → Window → Devices and Simulators → tu iPhone → Identifier.)

### Importante sobre cuentas gratuitas
Con un Apple ID **gratuito**, las apps instaladas en el iPhone **caducan a los 7 días** y hay que volver a pulsar ▶ (los datos se conservan si no desinstalas la app). Con el **Apple Developer Program** (99 €/año) duran un año y podrías usar TestFlight.

## 4) Actualizar la app cuando cambie la web
Cada compilación vuelve a copiar la web automáticamente (`build-web.sh`). Solo tienes que hacer `git pull` y volver a pulsar ▶ (o `./install-mac.sh`).

## Notas técnicas
- La web se carga con `file://` desde el paquete de la app (origen estable para `localStorage`/IndexedDB).
- La copia de seguridad guarda las claves `arcana.*` de `localStorage` (incluye tu clave de IA si la pusiste). **No** guarda los archivos de la biblioteca (IndexedDB): exporta/guarda tus libros aparte.
- Iconos: `tools/make_icons.py` los regenera (necesita `pip3 install pillow`).
- macOS usa App Sandbox con permisos de red, ubicación y archivos elegidos por ti (`macOS/Arcana-macOS.entitlements`).
