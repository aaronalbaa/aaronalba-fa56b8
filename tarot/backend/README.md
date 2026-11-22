# Nube, sincronización y amigos (opcional)

Arcana funciona 100 % en local. Si quieres **sincronizar móvil y ordenador cada 15 s** y usar la **biblioteca social** (amigos, colecciones, regalos), necesitas tu propio proyecto gratuito de Supabase:

1. Crea una cuenta en https://supabase.com y un proyecto nuevo (plan Free).
2. **Authentication → Providers → Email**: deja activado el correo y **desactiva «Confirm email»** (así puedes crear la cuenta desde la app sin pasos extra).
3. **SQL Editor → New query**: pega el contenido de `supabase.sql` y pulsa **Run**.
4. **Project Settings → API**: copia la *Project URL* y la clave *anon public*.
5. En Arcana: **Yo → Ajustes → Nube y sincronización → Conectar mi nube**. Rellena URL, clave, correo, contraseña y una **frase secreta de cifrado** (la misma en todos tus dispositivos). Pulsa *Crear cuenta* en el primero y *Entrar* en los demás.
6. En **Biblioteca → Amigos** crea tu @usuario y añade a tus amigos por el suyo.

## Qué se sincroniza y cómo
- Perfil, memoria de la IA, entrevista, diario, chat, progreso, misiones, biblioteca (metadatos, subrayados y notas), vida (hábitos, salud, metas, finanzas), favoritos y sincronicidades.
- Cada bloque se **cifra en tu dispositivo con AES-GCM** (clave derivada de tu frase secreta con PBKDF2, 150.000 iteraciones) antes de subirse: el servidor solo guarda texto ilegible. **Si olvidas la frase, no hay forma de recuperar los datos.**
- Tus **claves de IA no se sincronizan** (ajustes se quedan en cada dispositivo). Los **archivos de libros** (EPUB/PDF) tampoco: viven en cada dispositivo; compártelos con AirDrop o el botón *Regalar*.
- Si dos dispositivos editan a la vez, las listas (diario, chat, favoritos) se **fusionan**; en lo demás gana el cambio más reciente.

## Amigos y regalos
- Solo tu @usuario, tu nombre visible, tu nivel (XP) y los **libros que hayas marcado como leídos** se muestran a tus amigos. Nada más.
- Las políticas de seguridad (RLS) están en `supabase.sql`: nadie puede leer tus bloques cifrados, ni tu ficha sin ser amigo, ni enviarte regalos sin serlo.
- Los regalos son un **aviso con dedicatoria**; el archivo del libro lo envías tú por AirDrop/mensajes (no alojamos libros en el servidor).

## Estado de las pruebas
El esquema SQL y sus políticas se han probado en un PostgreSQL 16 real, y el cliente contra un servidor de pruebas que traduce las peticiones a ese esquema. **No se ha probado contra un proyecto real de Supabase**; si algo falla en tu proyecto, el mensaje aparece en *Ajustes → Nube*.
