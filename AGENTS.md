# Guía para agentes · CanchaYa

## Contexto y stack

CanchaYa es una plataforma frontend de reservas deportivas en español. El stack tecnológico oficial consiste en:

- **Framework & Core:** React 19, TypeScript (~5.7) y Vite 8.
- **Compilador React:** React Compiler habilitado mediante el plugin Babel en `vite.config.js`.
- **Estilos:** Tailwind CSS v4 (mediante `@tailwindcss/vite`) con tokens de diseño inspirados en shadcn/ui y la directiva `@theme`.
- **Componentes:** Componentes atómicos estructurados según los patrones de shadcn/ui con `class-variance-authority` (`cva`), `clsx` y `tailwind-merge` (`cn`).
- **Iconos:** `lucide-react`.
- **Identidad visual:** Color primario `#155DFC` (`--primary`), tipografía Lato.
- **Persistencia:** Almacenamiento local mediante `localStorage` gestionado exclusivamente a través de la capa de servicios (`src/services/`). No hay backend, clientes HTTP ni dependencias de red externas por el momento.

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
│   ├── auth-service.ts              # Autenticación, registro y hashing local
│   ├── local-data-service.ts        # Consulta y guardado de canchas y reservas
│   ├── storage-service.ts           # Wrapper seguro tipado sobre localStorage
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

---

## Persistencia y Servicios

- La persistencia se maneja exclusivamente en `localStorage` a través de los servicios centralizados en `src/services/` (`auth-service.ts`, `local-data-service.ts`, `storage-service.ts`).
- Las páginas y componentes de los flujos **nunca deben leer ni escribir directamente en `localStorage`**.
- No introducir clientes HTTP (`fetch`, `axios`), variables de URL de backend ni llamadas de red externas mientras el proyecto se mantenga en modo local.

---

## Reservas y coordinación entre flujos

- La entidad compartida `Reservation` de `src/types/index.ts` es el contrato único para cliente, recepción y administración. No crear modelos paralelos dentro de un flujo.
- Toda lectura y escritura de reservas pasa por `src/services/local-data-service.ts`; las transiciones y reglas de negocio se aplican mediante `src/services/reservation-service.ts`. Nunca acceder directamente a `localStorage` desde páginas, componentes o hooks.
- Una reserva registra cliente, cancha (`courtId` y nombre visible), fecha, horas de inicio y fin, estado, monto base, fecha de creación, método y estado de pago, observaciones y, cuando aplique, asistencia e historial de reprogramaciones. Los campos opcionales mantienen compatibilidad con datos locales anteriores; las nuevas reservas deben establecer `createdAt`, `courtId`, `paymentMethod` y `paymentStatus`.
- El flujo de cliente debe permitir reservar solo canchas disponibles y horarios acordes con el horario semanal y sin solaparse con reservas activas. La reserva se persiste como `PENDIENTE` y pago `PENDIENTE` por el servicio compartido. No mostrar ni crear reservas de ejemplo.
- Una reserva `PENDIENTE` debe confirmarse dentro de los primeros 15 minutos desde `createdAt`; vencido ese plazo, el servicio la cambia automáticamente a `CANCELADA`.
- Transiciones permitidas: `PENDIENTE → CONFIRMADA | CANCELADA` y `CONFIRMADA → EN_CURSO | CANCELADA`. Al llegar la hora de fin, el servicio cambia a `FINALIZADA` si hay asistencia registrada o a `NO_ASISTIO` si no la hay. `CANCELADA`, `FINALIZADA` y `NO_ASISTIO` son estados terminales.
- Recepción registra asistencia solo desde 15 minutos antes del inicio y hasta la hora de fin. Al marcarla, el estado pasa a `EN_CURSO`. Recepción y administración deben refrescar las transiciones automáticas y los cambios externos leyendo el mismo servicio; no duplicar el ciclo de vida en la interfaz.
- La cancelación manual de reservas pendientes o confirmadas solo se permite hasta 2 horas antes del inicio. Si la reserva está pagada, cancelar cambia su pago a `POR_REEMBOLSAR`; completar el reembolso es una acción posterior que lo cambia a `REEMBOLSADO`.
- Solo se reprograman reservas pendientes o confirmadas. Antes de cambiar fecha u horario, el servicio verifica la cancha, el horario de atención y que no haya solapamientos. Cada cambio conserva el horario anterior y el nuevo, añade un recargo del 15% del monto base y mantiene su cobro individual (`PENDIENTE` o `PAGADO`) sin alterar el pago base.
- Los filtros y gráficos usan datos reales del servicio y respetan los filtros activos. Una exportación todavía no implementada debe identificarse como próxima funcionalidad; no simular una descarga PDF exitosa.
- Al añadir estados de reserva o pago, actualizar las etiquetas y las vistas de recepción y administración. Validar las reglas en el servicio además de reflejarlas en la interfaz y proporcionar feedback accesible para cada acción.

## Validación Obligatoria del Código

Antes de dar por finalizado cualquier cambio en el repositorio, deben ejecutarse y aprobarse sin advertencias:

1. **Verificación de Tipos:** `npm run typecheck` (`tsc --noEmit`) → 0 errores de TypeScript.
2. **Linter:** `npm run lint` (`eslint .`) → 0 errores y 0 advertencias.
3. **Compilación:** `npm run build` (`tsc --noEmit && vite build`) → empaquetado exitoso.
