# Tero-Uy

Aplicación web privada para organizar tus cuentas digitales. React + Vite + Supabase, con las claves cifradas en el navegador.

## Cómo funciona el cifrado (léelo)

- Las claves **nunca** viajan ni se guardan en texto plano.
- Se cifran en tu navegador con AES-GCM (256 bits). La clave se deriva de tu **contraseña maestra** con PBKDF2-SHA256 y 310.000 iteraciones, usando un `salt` y un `IV` aleatorios distintos para cada registro.
- A Supabase solo llegan `clave_cifrada`, `clave_salt` y `clave_iv` en base64.
- La contraseña maestra no se envía a Supabase, no se guarda en `localStorage`, `sessionStorage` ni cookies. Vive en la memoria de la pestaña y se borra al cerrar sesión o recargar.
- Por eso, al recargar la página, la bóveda aparece **bloqueada**: sigues logueado, pero debes reintroducir la maestra para ver claves.

### Si pierdes la contraseña maestra

No hay recuperación. No existe verificador almacenado ni escrow: la maestra es la única llave. Lo que puedes hacer es entrar, escribir una maestra nueva y **volver a guardar cada clave** (editar el registro y escribir la clave de nuevo), lo que la recifra con la nueva. Los demás campos no se ven afectados.

Si escribes mal la maestra, el desbloqueo se acepta igual y el error aparece al intentar mostrar una clave ("Contraseña maestra incorrecta").

## Requisitos previos

- Node.js 18+ y npm (en Termux: `pkg install nodejs`).
- Un proyecto de Supabase.
- Web Crypto disponible: usa **`http://localhost:5173`**. Si abres la app por la IP de tu red (`http://192.168.x.x:5173`), el navegador no considera el contexto seguro y `crypto.subtle` no existe.

## Instalación

```bash
pkg update && pkg install nodejs git
git clone https://github.com/TU-USUARIO/tero-uy.git
cd tero-uy
npm install
cp .env.example .env
```

Edita `.env` con `nano .env` y rellena:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

Ambos valores están en Supabase → Project Settings → API. La `anon key` es pública; la protección real la da RLS.

## Base de datos

1. Supabase → SQL Editor → New query.
2. Pega el SQL completo de la sección 5 del proyecto y ejecútalo.
3. Verifica en Table Editor que `cuentas_tero` tiene RLS activado.
4. Authentication → Providers → Email: activa el registro con email. Crea tu usuario en Authentication → Users → Add user (marca "Auto Confirm" para no depender de correos).

## Ejecutar

```bash
npm run dev
```

Abre `http://localhost:5173` en el navegador del mismo teléfono.

Comprobaciones rápidas:
- La pantalla de login carga con el logo y el fondo amarillo.
- Tras entrar, la consola de Termux no muestra errores.
- En Supabase → Authentication → Users aparece tu usuario.

Para probar desde otro dispositivo de la red: `npm run dev -- --host`, entra por la IP y ten en cuenta la limitación de Web Crypto.

## Compilar para producción

```bash
npm run build
npm run preview
```

## GitHub

```bash
git init
git add .
git commit -m "Tero-Uy: aplicación inicial"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/tero-uy.git
git push -u origin main
```

`.env` está en `.gitignore`: nunca subas credenciales.

## Pruebas manuales

1. Login con campos vacíos → mensajes de validación.
2. Login con contraseña errónea → "Correo o contraseña incorrectos".
3. Login correcto → panel, saludo con tu nombre, contador en 0.
4. Recargar → sigues dentro, bóveda bloqueada.
5. Desbloquear con menos de 8 caracteres → error.
6. Agregar cuenta sin correo → error; con correo inválido → error.
7. Agregar cuenta válida con clave → aparece arriba, contador sube.
8. Pulsar "Ver" → se muestra la clave; "Ocultar" → vuelve a `••••••`.
9. Recargar y desbloquear con maestra **incorrecta** → al pulsar "Ver" sale error.
10. Editar sin tocar la clave → se conserva; marcar "Eliminar la clave guardada" → queda vacía.
11. Agregar duplicado (mismo correo + plataforma) → "Ya tienes registrada esa cuenta".
12. Buscar por plataforma → filtra; buscar texto inexistente → "Sin resultados".
13. Eliminar → pide confirmación; al aceptar desaparece.
14. Cerrar sesión → vuelve al login; recargar → sigue en login.
15. Con dos usuarios: cada uno ve solo sus filas.
16. En Supabase, `select * from cuentas_tero` → `clave_cifrada` es base64 ilegible.
17. En móvil: cada fila es tarjeta, sin scroll horizontal, modal ocupa el ancho.
18. `npm run build` termina sin errores.

## Estructura

```
src/
  components/   Login, Panel, Header, CuentaForm, CuentaCard, VaultLock, ConfirmDialog, Toast
  lib/          crypto, cuentas, errores, validaciones
  App.jsx  main.jsx  index.css  supabaseClient.js
```
