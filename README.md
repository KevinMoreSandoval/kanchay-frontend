# CanchaYa · Frontend

Aplicación de reservas deportivas con React 19, TypeScript, Vite 8 y Tailwind CSS v4. Tiene flujos de cliente, recepción y administración conectados al backend de este repositorio.

Este documento describe el comportamiento implementado en las pantallas y los servicios actuales. Una operación se muestra como exitosa después de recibir la respuesta del API. Los registros de negocio viven en MySQL; el navegador mantiene datos temporales en memoria.

## Despliegue

Consulta [DEPLOYMENT.md](DEPLOYMENT.md) para publicar en Vercel y conectar el backend en Render. Se incluyen `vercel.json`, Node.js 22.x y un proxy `/backend` que permite restaurar la sesión con una cookie del mismo dominio. El rewrite apunta a `https://sports-booking-system-backend.onrender.com`; configura `VITE_API_URL=/backend` en Vercel y las variables del backend según la guía.

## Ejecutar en desarrollo

1. Inicia MySQL y el backend siguiendo `../sports-booking-system-backend/README.md`.
2. Ejecuta `npm install` dentro de `kanchay-frontend`.
3. Copia `.env.example` a `.env.local` si necesitas cambiar `VITE_API_URL`.
4. Ejecuta `npm run dev` y abre la dirección que indique Vite, normalmente `http://localhost:5173`.

En desarrollo, sin configuración adicional, el API se consulta en `http://localhost:8080`; la compilación de producción usa `/backend`. Reinicia Vite después de cambiar variables de entorno. El CORS del backend admite por defecto los orígenes locales `http://localhost:5173` y `http://localhost:5174`; en Render se configura con `CORS_ALLOWED_ORIGINS`.

Las imágenes de canchas requieren Cloudinary configurado en el backend. El frontend no recibe sus credenciales. Las notificaciones por correo dependen de la configuración y las preferencias del backend; no equivalen a confirmar una reserva.

## Acceso y permisos

| Flujo          | Acceso implementado                                                                                                                                                   |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cliente        | Catálogo, detalle de canchas, registro de reservas propias, historial, detalle y cancelación permitida.                                                               |
| Recepción      | Dashboard diario, reservas de clientes, alta y consulta de clientes, confirmación, asistencia, cancelación, reprogramación, registro de pagos, recargos y reembolsos. |
| Administración | Dashboard, CRUD de usuarios y canchas, y gestión de reservas existentes.                                                                                              |

En `/`, la sesión determina el módulo. `/admin` y `/recepcionista` exigen el rol correspondiente. Las secciones del menú se seleccionan mediante estado de React: los nombres como `/admin/canchas` en la barra lateral no constituyen un sistema completo de rutas independientes ni conservan la sección al recargar.

El backend controla los permisos efectivos y consulta el rol vigente de la cuenta activa. Tener un JWT emitido antes de un cambio de rol no conserva los permisos anteriores. Solo ADMIN puede crear, editar, desactivar, eliminar canchas y subir sus imágenes. Recepción no tiene CRUD general de usuarios: puede consultar y registrar clientes.

## Autenticación y sesión

- Login por correo y contraseña mediante `POST /auth/login`. El formulario exige correo válido y contraseña no vacía; no impone al login las reglas de contraseña del registro.
- Registro mediante `POST /auth/register`, seguido de `GET /perfil` para obtener el usuario real. El backend asigna el rol CLIENTE.
- El registro exige nombre y apellido, DNI de 8 dígitos, correo válido, teléfono de 9 dígitos, fecha de nacimiento válida y no futura, contraseña y confirmación coincidentes, y aceptación de términos.
- La contraseña de registro y las contraseñas de personal requieren al menos 8 caracteres, mayúscula, minúscula y número; se limita su longitud a 72 bytes UTF-8.
- Una respuesta de autenticación solo se acepta como sesión después de obtener el perfil. Los errores de credenciales, duplicados y validación se muestran mediante toast y errores por campo.
- Al recargar, `GET /auth/session` restaura la sesión desde una cookie HttpOnly y se vuelve a consultar el perfil. El JWT vive en memoria y se comprueba su vencimiento.
- `POST /auth/logout` elimina la cookie. BroadcastChannel comunica cambios de sesión entre pestañas; el backend no mantiene una lista de revocación de JWT.

Ningún módulo de producción utiliza `localStorage`, `sessionStorage` ni IndexedDB. Los formularios y borradores no sobreviven a una recarga. Los datos del antiguo prototipo no se leen ni se importan.

## Casos de uso del cliente

### Buscar y registrar una reserva

1. El catálogo consulta `GET /canchas/disponibles`; permite buscar por nombre, características y ubicación. La pantalla distingue carga, error, catálogo vacío y búsqueda sin resultados.
2. El detalle muestra la información y las imágenes de la cancha. Al reservar, el cliente elige fecha e intervalos recibidos del backend.
3. Se exige al menos un intervalo disponible. Los intervalos seleccionados deben ser consecutivos, sin duplicados, vigentes y con la tarifa recibida del API. Un horario vencido o una selección desactualizada bloquean continuar.
4. El cliente elige Yape/Plin, tarjeta o efectivo. Seleccionar el método solo registra una preferencia; no ejecuta un cobro.
5. `POST /api/reservas` envía cancha, cliente, fecha, inicio, fin y método de pago. El servidor valida propiedad, cliente activo, horario, cruces y tarifa; calcula el importe definitivo.
6. La pantalla de resultado muestra la reserva registrada como pendiente y explica el plazo para que recepción la confirme.

El importe se calcula por duración en minutos usando la tarifa promocional si existe, o la tarifa regular. Una selección que parecía disponible puede ser rechazada si otra persona reservó ese horario antes del envío: el backend tiene la última decisión.

### Consultar y cancelar reservas propias

`Mis reservas` consulta `/api/reservas/mias`. Cada tarjeta abre un diálogo con los datos actuales, el importe base, los estados de reserva y pago y el historial de reprogramaciones y recargos cuando existe.

Cancelar requiere confirmación explícita, el permiso `puedeCancelar` del API y las reglas de estado y anticipación descritas más abajo. Un rechazo conserva el diálogo. El cliente no confirma pagos, no marca asistencia y no reprograma por sí mismo.

### Contactar al establecimiento por WhatsApp

El teléfono es **917397169**, con código de país **+51**, fijo en `src/app/protected/client/contact.ts`. La tarjeta de pago y `WhatsAppReservationButton` comparten esa constante. No consultan ni modifican el teléfono de configuración del backend.

El botón flotante muestra «Confirma tu reserva» y cambia a «Haz clic» al pasar el cursor o enfocarlo con el teclado. Abre `https://wa.me/51917397169` en otra pestaña con un mensaje preparado. Si recibe una reserva pendiente, incluye ID, cliente, cancha, fecha y horario; de lo contrario usa un mensaje general. La tarjeta de pago también permite llamar al mismo número.

El usuario decide enviar el mensaje y adjuntar su comprobante en WhatsApp. Abrir el enlace no registra un pago, no confirma la reserva y no detiene el plazo de vencimiento.

## Casos de uso de recepción

| Caso                  | Comportamiento implementado                                                                                                                                                                        |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Consultar la jornada  | Dashboard con reservas del día, búsqueda por cliente o cancha, próximos turnos y actividad. Los contadores diarios distinguen total, en curso, finalizadas y no asistencia.                        |
| Buscar reservas       | Filtros por próximas, hoy, pasadas o fecha concreta; estado, cancha y búsqueda por ID, cliente o cancha. Paginación de 10 registros. «Próximas» incluye las reservas con fecha de hoy en adelante. |
| Registrar una reserva | Asistente de tres pasos: buscar cliente por DNI, completar cancha/fecha/horas/método/observaciones y revisar antes de enviar.                                                                      |
| DNI no encontrado     | Permite abrir el alta de cliente y continuar con el cliente creado. Un error de red o permisos no se interpreta como cliente inexistente.                                                          |
| Registrar un cliente  | Guarda nombre, apellido, DNI, correo, teléfono y fecha de nacimiento mediante `/api/clientes`. El backend fija rol CLIENTE y contraseña inicial igual al DNI.                                      |
| Consultar clientes    | Listado con búsqueda por nombre, correo o teléfono, paginación e historial individual de reservas con detalle. No hay edición o eliminación de clientes desde esta pantalla.                       |
| Gestionar una reserva | Las acciones disponibles dependen del estado, del plazo de confirmación, del horario y del pago. Cada acción espera al servidor antes de mostrar éxito.                                            |

El formulario de reserva de recepción admite efectivo, tarjeta, transferencia y Yape/Plin. Valida cancha activa, fecha futura, rango de horas, días habilitados, tarifa positiva y observaciones de hasta 500 caracteres. La disponibilidad y los cruces se verifican de nuevo en el backend.

## Reglas y casuísticas de las reservas

Las horas de negocio de las reservas se interpretan en `America/Lima` (UTC−05:00). Los estados del API se adaptan a mayúsculas en el modelo compartido del frontend.

El personal dispone de una acción conjunta: **Registrar pago y confirmar**. Los dos endpoints existentes (`PATCH /api/reservas/{id}/estado` con `confirmada` y `PATCH /api/reservas/{id}/pago` con `PAGADO`) aplican esa misma regla en el servidor; el frontend realiza una sola petición. Las reservas antiguas confirmadas con pago pendiente permiten registrar el pago sin alterar su historial. No se modifican masivamente registros anteriores.

| Situación                                       | Resultado implementado                                                                                                                                   |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Registrar una reserva con cualquier método      | Estado `PENDIENTE` y pago `PENDIENTE`. Se abre un plazo de 15 minutos desde su creación.                                                                 |
| Confirmar dentro del plazo                      | Recepción o administración registra el pago base completo y cambia la reserva a `CONFIRMADA` y el pago a `PAGADO` en una sola transacción.               |
| Registrar el pago base                          | El pago pasa a `PAGADO` y la reserva queda `CONFIRMADA` en la misma operación.                                                                           |
| Cumplir exactamente 15 minutos sin confirmación | La reserva pendiente pasa a `CANCELADA`. Se rechazan el pago y la confirmación fuera de plazo.                                                           |
| Cancelar manualmente                            | Solo reservas pendientes o confirmadas, hasta 2 horas antes del inicio, inclusive. El cliente solo puede cancelar las propias.                           |
| Intentar cancelar con menos de 2 horas          | Se rechaza. Esto también aplica a una reserva recién creada cuyo turno comienza dentro de ese margen.                                                    |
| Cancelar una reserva pagada                     | El pago pasa a `POR_REEMBOLSAR`. Completar el reembolso es una acción posterior del personal que lo cambia a `REEMBOLSADO`.                              |
| Registrar asistencia                            | Solo una reserva confirmada, desde 15 minutos antes del inicio y estrictamente antes de su hora de fin. Pasa a `EN_CURSO`.                               |
| Llegar a la hora de fin                         | Una reserva confirmada o en curso pasa a `FINALIZADA` si tiene asistencia; de lo contrario pasa a `NO_ASISTIO`.                                          |
| Reprogramar                                     | Solo pendientes o confirmadas vigentes. Exige fecha u horario distinto, futuro, dentro de la atención de la misma cancha y sin solapamientos.            |
| Cada reprogramación                             | Conserva el importe base y añade un recargo del 15% de ese importe, con su cobro independiente. Mantiene el horario anterior y el nuevo en el historial. |
| Reprogramar una pendiente                       | No reinicia el plazo de 15 minutos de confirmación.                                                                                                      |
| Cobrar un recargo                               | El personal cambia ese recargo de pendiente a pagado; no se permite cobrarlo dos veces.                                                                  |
| Dos solicitudes sobre un horario ocupado        | El backend rechaza el solapamiento. El frontend no inventa una reserva exitosa.                                                                          |

`CANCELADA`, `FINALIZADA` y `NO_ASISTIO` son estados terminales de la reserva. El cobro de recargos pendientes se gestiona por separado; cancelar no los convierte automáticamente en reembolsos.

El backend aplica las transiciones automáticas en una tarea periódica de 30 segundos y durante las lecturas y acciones pertinentes. Los listados de reservas, usuarios y clientes se recargan tras mutaciones, al recuperar el foco y cada 30 segundos. No hay WebSocket ni garantía de actualización instantánea entre equipos.

## Casos de uso de administración

### Usuarios

El CRUD usa `/admin/usuarios`. Permite listar, buscar por nombre, correo o DNI, filtrar por rol, crear, editar, activar, desactivar y eliminar con confirmación.

- El DNI es obligatorio para clientes e inmutable después del alta. Una cuenta de personal creada sin DNI no se puede convertir a cliente desde ese formulario.
- Crear un cliente o cambiar una cuenta al rol CLIENTE asigna el DNI como contraseña. Editar un cliente sin cambiar su rol conserva su contraseña.
- Crear personal o cambiar entre roles de personal requiere contraseña explícita. Dejarla vacía al editar sin cambiar el rol conserva la actual.
- Correo, DNI y teléfono duplicados se rechazan en el backend.
- La cuenta del administrador que está operando está protegida frente a edición, cambio de estado y eliminación desde este CRUD.
- Si existen relaciones que impiden eliminar un usuario, se muestra el conflicto y puede desactivarse mediante la acción de estado.
- Un guardado inválido, sin cambios o en curso permanece deshabilitado.

### Canchas e imágenes

El formulario tiene tres pasos: datos y fotos; servicios y tarifas; ubicación, horario y estado. La creación se completa al final. En edición se puede guardar desde cualquier paso cuando hay cambios y el formulario completo es válido. Guardar conserva el paso; revertir los cambios deshabilita el botón.

Nombre, deporte y tarifa regular positiva son obligatorios. La capacidad, si se informa, debe ser un entero positivo; dimensiones positivas y precio promocional menor que el regular. Se conserva compatibilidad con campos complementarios vacíos de canchas anteriores.

Las fotos nuevas se suben antes de guardar a `POST /canchas/imagenes` como multipart, campo `file`. El backend devuelve una URL de Cloudinary y MySQL recibe las URLs. Se admiten hasta 6 imágenes JPG, PNG o WebP, de hasta 2 MB cada una. Base64 se limita a previsualización y borradores en memoria.

Si una subida falla, no se envía el guardado de la cancha. Si luego falla el guardado, el formulario mantiene sus datos y puede reutilizar las subidas exitosas al reintentar en esa misma sesión. Las imágenes con URL no se vuelven a subir.

Al editar se conserva el ID y se relee la cancha guardada para comprobar nombre y días disponibles. Eliminar exige confirmación; si existen registros asociados, el API rechaza la eliminación y debe desactivarse desde la edición. Los borradores solo viven en memoria y se descartan al recargar o cerrar sesión.

### Horario y disponibilidad

Cada cancha tiene un rango de inicio y fin y siete switches de días disponibles. El mismo rango se aplica a todos los días elegidos. Una selección vacía cierra toda la semana; los horarios antiguos sin selección explícita conservan los siete días.

```json
{
  "horario": {
    "horaInicio": "08:00",
    "horaFin": "22:00",
    "diasDisponibles": ["MONDAY", "FRIDAY"]
  }
}
```

`GET /canchas/{id}/slots?date=YYYY-MM-DD` devuelve `{ id, startTime, endTime, price, available }` por intervalo. El backend genera bloques de 60 minutos y, si sobra un tramo menor al final, calcula su precio proporcional. Omite los horarios ya vencidos y los días cerrados, y marca los intervalos ocupados.

El frontend consume estos intervalos; no los genera. Una cancha sin rango configurado no obtiene horarios inventados. El rango debe terminar después de empezar: no hay un horario nocturno que cruce de un día al siguiente ni rangos distintos por día en este formulario.

### Reservas y métricas

Administración consulta y gestiona reservas existentes con las mismas acciones del personal. Permite búsqueda por cliente/cancha, rango de fechas, estado de reserva, estado de pago y método de pago. El gráfico de siete días utiliza las reservas filtradas.

El dashboard consulta usuarios, canchas y `/admin/dashboard`. El dato `ingresosEstimados` procede de la suma de importes de reservas del backend; no debe interpretarse como caja efectivamente cobrada ni conciliación bancaria.

## Validación y mensajes

`src/lib/validation.ts` y `use-form-validation` comparten reglas de identidad, contraseñas, fechas y horas. Cada feature conserva sus reglas particulares en `validations.ts`. Los errores por campo se muestran al escribir o salir del control y se enlazan mediante `aria-invalid` y `aria-describedby`.

Los botones se deshabilitan según validación, cambios reales y solicitudes en curso. Los formularios conservan sus datos si falla la operación. No se trata un error 401 de sesión como un 403 de permisos ni se cierra un formulario por un éxito simulado.

Los mensajes transitorios pasan por `toast` y un único `Toaster` montado en `main.tsx`. Los diálogos abiertos mantienen los avisos visibles. Las validaciones, cargas, estados vacíos y confirmaciones permanecen junto a su contexto.

```ts
import { toast } from '@/services/toast-service';

toast.success('Cambios guardados.');
toast.error('No se pudieron guardar los cambios.');
```

La cola muestra hasta cuatro avisos, agrupa mensajes repetidos y permite cierre manual. Los tiempos se pausan con foco o puntero; `duration: 0` mantiene el aviso hasta cerrarlo. El cliente HTTP tiene timeout de 20 segundos y no publica toasts por su cuenta para evitar duplicados.

## Organización del código

```text
src/
  app/auth/                         # Login, registro, componentes y validaciones
  app/protected/client/
    components/                     # Flujo de reserva y acceso a WhatsApp
    courts/                         # Catálogo, detalle y selección de intervalos
    reservations/                   # Historial, detalle y cancelación propios
    contact.ts                      # Teléfono fijo y construcción del enlace
  app/protected/recepcionist/        # Clientes, reservas y operación diaria
  app/protected/admin/
    courts/                         # Formulario y CRUD de canchas
    users/                          # Formulario y CRUD de usuarios
    components/                     # Dashboard y gestión de reservas
  components/ui/                    # Controles y componentes visuales compartidos
  hooks/                            # Sesión, validación y colecciones remotas
  services/
    auth-service.ts                 # Autenticación y perfil
    session-service.ts              # JWT y usuario en memoria
    http-client.ts                  # Transporte HTTP y errores
    courts/                         # Contratos, mapeo, CRUD, imágenes y borradores
    users/                          # CRUD de usuarios
    clients/                        # Consulta y alta desde recepción
    reservations/                   # Contratos y operaciones de reservas
    reservation-service.ts          # Validación y acciones visibles
    toast-service.ts                # Cola de notificaciones
  types/                            # Modelos compartidos de negocio
  lib/                              # Utilidades y validación común
```

La comunicación HTTP se concentra en servicios. Los hooks administran carga, formularios y acciones; las pantallas componen los componentes del flujo. Los modelos compartidos evitan crear versiones distintas de una reserva para cada rol.

## Límites actuales

- «¿Olvidaste tu contraseña?» informa que la recuperación está en desarrollo; no envía un correo de recuperación desde este frontend.
- La exportación de reservas a PDF muestra un aviso de próxima funcionalidad; no descarga un archivo.
- No hay pasarela de pagos, cobro automático, QR de pago generado, conciliación ni carga de comprobantes de pago en la aplicación. Las tarjetas visuales de métodos de pago no implementan esas operaciones.
- El pago base se registra como completo y el reembolso como una transición completa; no hay un formulario de abonos parciales.
- «Registrar pago y confirmar» debe ejecutarse después de recibir el importe base completo. Tanto el endpoint de confirmación como el de pago guardan conjuntamente el pago `PAGADO`, el monto pagado completo y el estado `CONFIRMADA`. No se cobra dos veces ni se reabren reservas canceladas o finalizadas. Los recargos y reembolsos conservan sus operaciones independientes.
- Los campos de configuración del backend como `autoConfirm`, anticipo o máximo de días de anticipación no constituyen reglas aplicadas por el flujo actual de reservas. El plazo efectivo es el descrito en este documento.
- Existen endpoints del backend para comprobantes y limpieza de historial, pero no están consumidos por los servicios del frontend actual.
- La navegación interna y los borradores no se conservan al recargar. El sistema requiere conexión para consultar o guardar los registros.

## Verificación

| Comando                     | Qué comprueba                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`         | Tipos TypeScript.                                                                                             |
| `npm run lint`              | Reglas ESLint.                                                                                                |
| `npm run test:deployment`   | Proxy de producción, cookie de sesión, Bearer y subida multipart.                                             |
| `npm run build`             | Tipos y compilación de producción.                                                                            |
| `npm run test:auth`         | Contratos de autenticación, perfil y sesión.                                                                  |
| `npm run test:courts`       | Contratos de canchas, imágenes y estados del formulario.                                                      |
| `npm run test:users`        | CRUD de usuarios, permisos, estado y conflictos.                                                              |
| `npm run test:reservations` | Contratos de reservas/clientes, permisos del cliente, contacto fijo y ausencia de almacenamiento persistente. |
| `npm run test:forms`        | Validaciones y estados de envío de formularios.                                                               |
| `npm run test:toast`        | Cola, tiempos, pausas, duplicados y accesibilidad de avisos.                                                  |

Las pruebas frontend usan respuestas HTTP simuladas; no prueban por sí solas la base de datos, Cloudinary, el envío de correos ni WhatsApp. Para ejecutar todas las suites con concurrencia acotada:

```sh
node --test --test-concurrency=1 tests/auth.test.mjs tests/courts/court-service.test.mjs tests/courts/court-form.test.mjs tests/toast/toast.test.mjs tests/users/user-service.test.mjs tests/reservations/reservation-api.test.mjs tests/reservations/client-reservations.test.mjs tests/reservations/payment-contact.test.mjs tests/forms/validation.test.mjs tests/deployment.test.mjs
```

### Recorrido manual con el backend

1. Registrar una cuenta, recargar y comprobar restauración de sesión; cerrar sesión y volver a entrar. Intentar un correo o DNI duplicado y credenciales incorrectas.
2. Como administrador, crear una cancha con fotos, tarifa, rango y días seleccionados. Cambiar su nombre desde el primer paso y comprobar que se guarda; revertir cambios y comprobar que guardar queda deshabilitado.
3. Como cliente, comprobar que un día cerrado no ofrece horarios. Seleccionar intervalos consecutivos, registrar una reserva y comprobar que aparece pendiente tanto en cliente como en recepción.
4. Abrir WhatsApp y comprobar el destinatario `+51 917397169` y el mensaje. Cerrar WhatsApp sin enviar: la reserva debe seguir pendiente.
5. Como personal, usar «Registrar pago y confirmar» después de recibir el dinero y comprobar que la misma respuesta deja la reserva confirmada y pagada. En otra reserva, dejar vencer los 15 minutos y comprobar que no se permite registrar el pago ni confirmar.
6. Cancelar una reserva pagada con al menos 2 horas de anticipación y completar el reembolso. Comprobar que una cancelación fuera del plazo se rechaza.
7. Reprogramar una reserva vigente y comprobar que conserva el importe base, registra el horario anterior y añade un recargo del 15% que se cobra por separado.
8. Intentar reservar el mismo horario desde dos sesiones: solo debe aceptarse una reserva que ocupe ese tramo.
9. Comprobar que la asistencia solo está disponible desde 15 minutos antes y antes del fin; al vencer, refrescar y verificar finalización o no asistencia.
10. Desactivar un usuario o cambiar su rol y comprobar que el backend rechaza acciones ya no autorizadas. Verificar que la cuenta propia del administrador está protegida y que las eliminaciones con relaciones muestran el conflicto.

Usar cuentas y reservas de prueba para este recorrido: estas acciones sí modifican registros reales del backend.
