# CanchaYa Frontend

Frontend de CanchaYa, una aplicación de reservas deportivas construida con React 19, Vite y CSS Modules. La interfaz está en español y usa `#155DFC` como color principal.

## Desarrollo

Requiere Node.js y npm. Instala dependencias con `npm install` y ejecuta `npm run dev` para iniciar Vite.

Comandos disponibles:

- `npm run lint`: ESLint para JavaScript y JSX.
- `npm run build`: compilación de producción.
- `npm run preview`: sirve localmente el último build.

No hay scripts de test ni typecheck configurados.

## Funcionalidad actual

- `/` muestra login y registro; tras autenticarse presenta el dashboard de cliente.
- `/recepcionista` muestra el dashboard de recepción para la cuenta local asignada a `recepcion@kancha.com`.
- `/admin` muestra un resumen local para la cuenta asignada a `admin@kancha.com`.
- El registro crea únicamente cuentas de Cliente y define su contraseña.
- Acceso fijo de Recepción: `recepcion@kancha.com` / `Recepcionista2026!`.
- Acceso fijo de Admin: `admin@kancha.com` / `CanchaYaAdmin2026!`.
- Los listados de canchas y reservas son datos locales de demostración.
- No hay conexión a backend. Usuarios, sesión, canchas y reservas se almacenan en `localStorage` a través de servicios locales.

El despacho de módulos es manual y pasa por `src/app/App.jsx`; no se utiliza una biblioteca de routing.

La autenticación y los roles en el navegador son solo para prototipo y no son controles de seguridad. Las contraseñas fijas están en el código del frontend; no reutilizarlas fuera de esta demo. Los datos del cliente pueden modificarse desde el navegador.

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.
You can also try [the experimental native React Compiler support in plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md#rust-react-compiler) by using `compiler: true` in the plugin options instead of using the Babel plugin.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
