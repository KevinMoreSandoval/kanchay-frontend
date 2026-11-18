# Frontend en Vercel

El proyecto incluye `vercel.json` para Vite, build con `npm ci` y `npm run build`, salida `dist`, rutas SPA y proxy HTTP hacia Render. Usa Node.js 22.x, declarado en `package.json`.

## Configuración

1. Sube el frontend a su repositorio e impórtalo en Vercel. Si importas un monorepo con ambos proyectos, selecciona **Root Directory: `kanchay-frontend`**. Si el repositorio contiene solo este proyecto, usa su raíz.
2. Selecciona el preset Vite y Node.js 22.x. `vercel.json` ya declara comandos y directorio de salida.
3. Despliega el backend siguiendo [su guía](../sports-booking-system-backend/DEPLOYMENT.md) y copia la URL HTTPS real que asigne Render.
4. En `vercel.json`, reemplaza `https://kanchay-api.onrender.com` en el primer rewrite por esa URL. Es una referencia inicial que debe coincidir con tu servicio real; no es una URL desplegada ni se sustituye mediante variables de Vercel.
5. En **Environment Variables** de Vercel añade `VITE_API_URL=/backend` para Production. Es también el valor predeterminado del código compilado si no se define la variable.
6. Despliega y configura en Render `FRONTEND_URL` y `CORS_ALLOWED_ORIGINS` con la URL exacta de Vercel, sin barra final, y `SESSION_COOKIE_PATH=/backend/auth`.

No pongas contraseñas, JWT_SECRET, credenciales de MySQL, SMTP ni Cloudinary en variables `VITE_*`: se incorporan al JavaScript público. Cambiar una variable de Vite requiere un nuevo despliegue.

## Peticiones y sesión

```text
Navegador → https://TU-FRONTEND.vercel.app/backend/... → https://TU-API.onrender.com/...
```

El rewrite `/backend/:path*` se evalúa antes del fallback SPA y conserva la ruta restante, método, query y cuerpo de la petición. El fallback excluye `/backend`, para no convertir errores del API en HTML de React. Las rutas del frontend como `/admin` y `/recepcionista` sirven `index.html`.

La sesión usa una cookie HttpOnly y Secure con Path `/backend/auth`, emitida por el backend y recibida desde el mismo dominio del frontend. Esto evita depender de cookies de terceros entre `vercel.app` y `onrender.com`. Se conserva SameSite=Strict. El JWT se mantiene en memoria y las peticiones de negocio usan Bearer.

Las respuestas del proxy no se cachean: esto incluye disponibilidad, datos privados y sesión. La configuración desactiva explícitamente el caché de rewrites externos de Vercel. Las imágenes siguen subiendo al backend y a Cloudinary; el teléfono de WhatsApp permanece fijo en `src/app/protected/client/contact.ts`.

Para previews, configura el origen exacto en CORS o usa un servicio de Render de pruebas y ajusta el rewrite en la rama correspondiente. No se habilita un comodín para cualquier proyecto de Vercel.

## Comprobación

- Abre `/admin` directamente y recarga: debe cargar React y pedir el rol correspondiente.
- Abre `/backend/health`: debe responder JSON con `status: UP`, nunca el HTML del frontend.
- Inicia sesión y revisa `/backend/auth/login`: la respuesta debe establecer la cookie Secure, HttpOnly y Path `/backend/auth`.
- Recarga: `/backend/auth/session` debe restaurar la sesión. Cierra sesión y comprueba que la cookie se elimina usando el mismo Path.
- Comprueba carga de catálogo, intervalos, subida de imágenes y «Registrar pago y confirmar».
- Si el backend usa el plan gratuito y está suspendido, el primer acceso puede tardar más que el timeout del frontend. La guía del backend explica el impacto sobre tareas programadas y SMTP; el Blueprint propone una instancia sin suspensión para el flujo de reservas.

## Desarrollo local

`npm run dev` conserva el acceso directo a `http://localhost:8080`, o al valor de `.env.local`. El proxy `/backend` de esta guía lo aplica Vercel; no existe automáticamente en `vite dev` ni en `vite preview`. No configures `/backend` en tu `.env.local` salvo que añadas un proxy local equivalente.

```sh
npm run typecheck
npm run lint
npm run test:deployment
npm run build
```

Las pruebas de despliegue verifican la URL de producción y el envío de cookie, Bearer y multipart. No crean recursos en Vercel ni validan un dominio remoto. La revisión final de cookies, DNS y proxy requiere las URLs desplegadas.

Referencias: [Vite en Vercel](https://vercel.com/docs/frameworks/frontend/vite), [rewrites](https://vercel.com/docs/routing/rewrites), [variables de entorno](https://vercel.com/docs/environment-variables).
