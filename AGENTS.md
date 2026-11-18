# Guía para agentes · CanchaYa

## Contexto y stack

CanchaYa es una plataforma frontend de reservas deportivas en español. El stack tecnológico oficial consiste en:

- **Framework & Core:** React 19, TypeScript (~5.7) y Vite 8.
- **Compilador React:** React Compiler habilitado mediante el plugin Babel en `vite.config.js`.
- **Estilos:** Tailwind CSS v4 (mediante `@tailwindcss/vite`) con tokens de diseño inspirados en shadcn/ui y la directiva `@theme`.
- **Componentes:** Componentes atómicos estructurados según los patrones de shadcn/ui con `class-variance-authority` (`cva`), `clsx` y `tailwind-merge` (`cn`).
- **Iconos:** `lucide-react`.
- **Identidad visual:** Color primario `#155DFC` (`--primary`), tipografía Lato.
- **Persistencia:** Autenticación, usuarios de administración y canchas usan el backend a través de servicios HTTP. La sesión se restaura desde una cookie HttpOnly y el JWT vive en memoria; los borradores de canchas solo viven en memoria. Reservas y clientes de recepción también se consultan y guardan mediante el API. Ningún flujo usa almacenamiento persistente del navegador.

---

## Arquitectura Modular por Flujos (Feature-First)

El proyecto centraliza los flujos de negocio bajo `src/app/`. El flujo de autenticación vive directamente en `src/app/auth/` y los flujos protegidos (por rol) bajo `src/app/protected/`. Los recursos transversales (componentes, hooks, servicios, tipos) permanecen en la raíz de `src/`.

```text
src/
├── components/                      # Componentes transversales y UI atómica
│   ├── ui/                          # Componentes atómicos base de UI (shadcn/ui)
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── form-field.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── password-input.tsx
│   │   ├── table.tsx
│   │   └── index.ts                 # Barrel export de componentes atómicos
│   ├── sidebar.tsx                  # Componente transversal (compartido entre flujos)
│   └── index.ts                     # Barrel export de componentes generales y UI
├── hooks/                           # Custom hooks generales y globales
│   ├── use-auth.ts                  # Hook global de sesión y autenticación
│   └── index.ts
├── services/                        # Capa transversal de servicios y persistencia
│   ├── auth-service.ts              # Autenticación, registro y restauración desde el API
│   ├── reservations/                # Contratos, mapeo y solicitudes de reservas
│   ├── clients/                     # Consulta y alta de clientes por HTTP
│   └── index.ts
├── types/                           # Tipos e interfaces globales de dominio
│   └── index.ts                     # User, Court, Reservation, AuthSession, etc.
├── lib/                             # Utilidades compartidas
│   └── utils.ts                     # Utilidad cn() para composición de clases
├── app/                             # Carpeta raíz de todos los flujos de la aplicación
│   ├── auth/                        # Flujo de Autenticación (público)
│   │   ├── components/              # Componentes exclusivos del flujo auth
│   │   │   ├── auth-layout.tsx      # Layout visual con banner y logo
│   │   │   └── terms-modal.tsx      # Diálogo accesible de términos y condiciones
│   │   ├── hooks/                   # Hooks exclusivos del flujo auth
│   │   │   ├── use-login-form.ts    # Lógica y validación del formulario de login
│   │   │   └── use-register-form.ts # Lógica y validación del formulario de registro
│   │   ├── login/
│   │   │   └── page.tsx             # Pantalla de inicio de sesión
│   │   └── register/
│   │       └── page.tsx             # Pantalla de registro
│   └── protected/                   # Flujos protegidos (requieren sesión activa)
│       ├── client/                  # Flujo de Cliente
│       │   ├── components/          # Componentes exclusivos del flujo cliente
│       │   │   ├── client-navbar.tsx
│       │   │   ├── client-hero.tsx
│       │   │   └── court-card.tsx
│       │   ├── hooks/
│       │   │   └── use-courts-catalog.ts
│       │   └── page.tsx
│       ├── recepcionist/            # Flujo de Recepción
│       │   ├── components/
│       │   │   ├── reception-topbar.tsx
│       │   │   ├── reception-kpis.tsx
│       │   │   └── reservations-table.tsx
│       │   ├── hooks/
│       │   │   └── use-reception-dashboard.ts
│       │   └── page.tsx
│       └── admin/                   # Flujo de Administración
│           ├── components/
│           │   ├── admin-header.tsx
│           │   ├── admin-kpis.tsx
│           │   ├── recent-users-card.tsx
│           │   └── courts-summary-card.tsx
│           ├── hooks/
│           │   └── use-admin-dashboard.ts
│           └── page.tsx
├── App.tsx                          # Orquestador raíz y despacho de módulos
├── index.css                        # Tailwind CSS v4, directiva @theme y variables
├── main.tsx                         # Punto de entrada de la aplicación
└── vite-env.d.ts                    # Declaración de tipos para Vite
```

---

## Reglas para Crear Componentes Atómicos de UI (`src/components/ui/`)

1. **Ubicación:** Todos los componentes atómicos reutilizables e independientes de negocio deben crearse en `src/components/ui/<nombre-componente>.tsx`.
2. **Nomenclatura:**
   - Archivo en `kebab-case.tsx` (ej: `button.tsx`, `form-field.tsx`, `password-input.tsx`).
   - Componente en `PascalCase` (ej: `Button`, `FormField`, `PasswordInput`).
3. **Composición de Clases:** Usar siempre la función `cn(...)` de `@/lib/utils` para combinar clases de Tailwind y props `className`.
4. **Variantes con CVA:** Para componentes con múltiples variantes visuales o tamaños (botones, badges, alertas), definir las variantes con `cva` de `class-variance-authority`.
5. **Reenvío de Refs:** Implementar `React.forwardRef` en componentes que envuelvan elementos nativos de HTML y asignar `displayName`.
6. **Tipado Estricto:** Extender los atributos HTML nativos correspondientes (`React.ButtonHTMLAttributes`, `React.InputHTMLAttributes`, etc.) y exportar las interfaces o types correspondientes.
7. **Barrel Export:** Todo componente nuevo en `src/components/ui/` debe exportarse en `src/components/ui/index.ts`.

---

## Reglas para Crear Componentes Generales (`src/components/`)

1. **Ubicación:** Crear en la raíz de `src/components/<nombre-componente>.tsx` (ej: `src/components/sidebar.tsx`).
2. **Criterio de Inclusión:** Solo deben colocarse aquí componentes de layout o interacción que **se compartan entre dos o más flujos diferentes** (por ejemplo, `Sidebar` utilizado tanto en `recepcionist` como en `admin`).
3. **Independencia de Negocio:** No deben contener lógica acoplada exclusivamente a un solo flujo. Deben recibir datos y callbacks a través de props tipadas.
4. **Barrel Export:** Exportar en `src/components/index.ts`.

---

## Reglas para Crear o Modificar un Flujo

Los flujos públicos van en `src/app/auth/` y los flujos protegidos en `src/app/protected/<flujo>/`. Cada flujo debe ser autocontenido:

1. **Componentes del Flujo (`src/app/[auth|protected/<flujo>]/components/`):**
   - Solo componentes específicos de la lógica de ese flujo.
   - Componer siempre desde `@/components/ui` (`Button`, `Card`, `Badge`, `Input`, etc.).
   - Archivos en `kebab-case.tsx`.
2. **Hooks del Flujo (`src/app/[auth|protected/<flujo>]/hooks/`):**
   - Toda la gestión de estado, filtrado, cálculos derivados o modales del flujo en un custom hook dedicado (`use-<nombre>.ts`).
   - Las vistas (`page.tsx`) deben ser declarativas: solo composición de componentes y consumo de hooks.
3. **Vistas del Flujo (`page.tsx` o `<subruta>/page.tsx`):**
   - **Exactamente un `<h1>`** por pantalla para accesibilidad y jerarquía semántica.
   - **100% Tailwind CSS v4**. Prohibido `style={{...}}` y archivos `.module.css`.
   - Usar siempre tokens del tema (`bg-background`, `text-foreground`, `bg-primary`, `border-border`, etc.).
4. **Imports entre flujos:** Nunca importar directamente de otro flujo. Los recursos compartidos deben subirse a `src/components/`, `src/hooks/` o `src/services/`.

---

## Reglas de Accesibilidad (a11y) y Calidad

1. **Iconografía:** Todo icono decorativo de `lucide-react` debe incluir obligatoriamente `aria-hidden="true"`.
2. **Controles sin Texto:** Botones o controles que solo contengan icono deben incluir un `aria-label` descriptivo.
3. **Integridad de Formularios:**
   - **Prohibido anidar elementos interactivos (`<button>`, `<a>`) dentro de etiquetas `<label>`**. Si un checkbox tiene enlaces o botones (ej: términos y condiciones), deben situarse adyacentes al `<label>`, nunca contenidos en él.
4. **Keys en Listas:** En mapas y listas (`.map(...)`), usar siempre identificadores estables y únicos (`key={item.id}`). **Nunca usar el índice numérico del array (`key={index}`)**.
5. **Manejo de Feedback:**
   - **Prohibido el uso de `window.alert()`**.
   - No dejar botones con funciones vacías o que solo hagan `console.log()`. Toda acción interactiva debe brindar retroalimentación visual en pantalla (alertas accesibles con `role="status"` o `role="alert"`, modales o badges).
   - Los mensajes transitorios de éxito, error, información y advertencia pasan por `toast` de `src/services/toast-service.ts`. No añadir banners duplicados en las páginas. `Toaster` se monta una sola vez junto a `App` en `main.tsx` y mantiene las notificaciones al navegar y dentro de diálogos nativos.
   - Llamar a `toast.success/error/info/warning` después de la acción o en su catch, nunca durante el render. `notifyToast` conserva el texto cuando además se necesita un estado para controlar formularios o reintentos. Las validaciones por campo, estados de carga, estados vacíos y confirmaciones permanecen junto a su contexto.

---

## Persistencia y Servicios

- Toda persistencia y comunicación con el backend pasa por los servicios de `src/services/`.
- Despliegue: Vercel usa `/backend` como base del API y un rewrite externo a Render antes del fallback SPA; no cachear respuestas de negocio. La cookie del perfil `prod` del backend usa Path `/backend/auth`, HttpOnly, Secure y SameSite=Strict. Desarrollo sigue usando `http://localhost:8080` y Path `/auth`. Consultar `DEPLOYMENT.md` antes de cambiar el proxy o las variables.
- Reutilizar `src/lib/validation.ts` y `use-form-validation` para identidad, fechas y horarios; conservar las reglas específicas en el `validations.ts` de cada feature. La misma validación debe controlar los errores por campo, `disabled` y el envío. Bloquear guardados inválidos, sin cambios o en curso; validar también en el backend las restricciones de los datos.
- **Ningún módulo debe leer ni escribir `localStorage`, `sessionStorage` ni IndexedDB.** Los registros viven en MySQL; React conserva únicamente snapshots del API y formularios temporales en memoria.
- Login y registro están conectados al backend: usar `http-client.ts`, `auth-service.ts`, `auth-contracts.ts` y `session-service.ts`. La URL se configura con `VITE_API_URL`. No autenticar con usuarios ni contraseñas locales. La cookie HttpOnly de `/auth` restaura la sesión mediante GET `/auth/session`; las peticiones de negocio requieren Bearer en memoria. Logout elimina la cookie en el backend. La sincronización entre pestañas usa BroadcastChannel. No persistir sesiones ni usuarios de administración en almacenamiento del navegador.
- Canchas usa `src/services/courts/`: contratos, adaptadores, CRUD HTTP y borradores en memoria separados. El tipo compartido vive en `src/types/courts.ts`; los componentes y hooks específicos viven en `admin/courts/` y `client/courts/`. No importar desde administración en servicios ni desde otros flujos.
- Las fotos nuevas de canchas pasan por `court-image-service.ts` y `POST /canchas/imagenes` antes del alta o edición. MySQL solo recibe URLs; Base64 se limita a la previsualización y borradores en memoria. No establecer manualmente Content-Type para solicitudes FormData.
- La creación, edición, cambio de estado, eliminación y subida de imágenes de canchas son exclusivas de ADMIN. El backend usa el rol vigente del usuario activo en la base de datos; el rol del JWT no debe mantener permisos anteriores a un cambio de rol.
- Usuarios de administración usan `src/services/users/` (contratos, adaptadores y CRUD HTTP) y `admin/users/` (componentes y hooks). El backend replica las reglas del formulario: clientes con contraseña inicial DNI, personal con contraseña explícita, DNI inmutable y contraseña vacía conserva la actual. Solo ADMIN puede gestionar usuarios y la cuenta propia está protegida.
- Clientes de recepción usan `src/services/clients/client-service.ts` y `/api/clientes`; reservas usan `src/services/reservations/` y `/api/reservas`. Los hooks compartidos `use-clients` y `use-reservations` recargan desde el servidor al mutar, enfocar y cada 30 segundos. Nunca crear identificadores ni registros de negocio en el navegador.

---

## Reservas y coordinación entre flujos

- La entidad compartida `Reservation` de `src/types/index.ts` es el contrato único para cliente, recepción y administración. No crear modelos paralelos dentro de un flujo.
- Toda lectura y escritura de reservas pasa por `src/services/reservations/reservation-api.ts`; `src/services/reservation-service.ts` solo valida formularios y determina acciones visibles. Las reglas, importes, cruces, estados, pagos e historial se validan y persisten en `service/reserva/ReservaWorkflowService` del backend. Esperar el resultado HTTP antes de cerrar formularios o mostrar éxito.
- Una reserva registra cliente, cancha (`courtId` y nombre visible), fecha, horas de inicio y fin, estado, monto base, fecha de creación, método y estado de pago, observaciones y, cuando aplique, asistencia e historial de reprogramaciones. Los campos opcionales mantienen compatibilidad con respuestas anteriores; las nuevas reservas deben establecer `createdAt`, `courtId`, `paymentMethod` y `paymentStatus`.
- El horario de una cancha combina un rango `horaInicio`/`horaFin` y `diasDisponibles` (días ISO MONDAY–SUNDAY), seleccionados mediante switches. Un rango se aplica a todos los días habilitados; la lista vacía significa cerrado toda la semana. El frontend envía `horario` y consume intervalos JSON de `/canchas/{id}/slots?date=...`; nunca genera intervalos ni persiste un horario distinto por día. El servidor valida los días y rangos al crear o reprogramar. La reserva se guarda en MySQL como `PENDIENTE` y pago `PENDIENTE`; no mostrar ni crear reservas de ejemplo.
- Una reserva `PENDIENTE` debe confirmarse dentro de los primeros 15 minutos desde `createdAt`; vencido ese plazo, el servicio la cambia automáticamente a `CANCELADA`.
- Confirmar y registrar el pago base son la misma operación de negocio: ambos endpoints deben persistir `CONFIRMADA`, pago `PAGADO` y monto pagado completo en una única transacción. Mostrar una sola acción «Registrar pago y confirmar» después de recibir el dinero; bloquear vencidas, canceladas y estados terminales. Recargos y reembolsos mantienen operaciones independientes.
- Transiciones permitidas: `PENDIENTE → CONFIRMADA | CANCELADA` y `CONFIRMADA → EN_CURSO | CANCELADA`. Al llegar la hora de fin, el servicio cambia a `FINALIZADA` si hay asistencia registrada o a `NO_ASISTIO` si no la hay. `CANCELADA`, `FINALIZADA` y `NO_ASISTIO` son estados terminales.
- Recepción registra asistencia solo desde 15 minutos antes del inicio y hasta la hora de fin. Al marcarla, el estado pasa a `EN_CURSO`. Recepción y administración deben refrescar las transiciones automáticas y los cambios externos leyendo el mismo servicio; no duplicar el ciclo de vida en la interfaz.
- La cancelación manual de reservas pendientes o confirmadas solo se permite hasta 2 horas antes del inicio. Si la reserva está pagada, cancelar cambia su pago a `POR_REEMBOLSAR`; completar el reembolso es una acción posterior que lo cambia a `REEMBOLSADO`.
- Solo se reprograman reservas pendientes o confirmadas. Antes de cambiar fecha u horario, el servicio verifica la cancha, el horario de atención y que no haya solapamientos. Cada cambio conserva el horario anterior y el nuevo, añade un recargo del 15% del monto base y mantiene su cobro individual (`PENDIENTE` o `PAGADO`) sin alterar el pago base.
- Los filtros y gráficos usan datos reales del servicio y respetan los filtros activos. Una exportación todavía no implementada debe identificarse como próxima funcionalidad; no simular una descarga PDF exitosa.
- Al añadir estados de reserva o pago, actualizar las etiquetas y las vistas de recepción y administración. Validar las reglas en el backend además de reflejarlas en la interfaz y proporcionar feedback accesible para cada acción.

## Validación Obligatoria del Código

Antes de dar por finalizado cualquier cambio en el repositorio, deben ejecutarse y aprobarse sin advertencias:

1. **Verificación de Tipos:** `npm run typecheck` (`tsc --noEmit`) → 0 errores de TypeScript.
2. **Linter:** `npm run lint` (`eslint .`) → 0 errores y 0 advertencias.
3. **Compilación:** `npm run build` (`tsc --noEmit && vite build`) → empaquetado exitoso.
