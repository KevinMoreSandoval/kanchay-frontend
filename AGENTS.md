# Flujo de desarrollo para Kanchay Frontend

Estas reglas aplican a todo cambio realizado en este repositorio.

## Flujo obligatorio

1. Revisar el estado actual del repositorio y localizar la pantalla, componente, hook o servicio afectado.
2. Definir el cambio en una tarea concreta, incluyendo estados de carga, error, vacío y éxito cuando correspondan.
3. Mantener la estructura existente de `src/app`: páginas por flujo, componentes compartidos, hooks y servicios.
4. Implementar el cambio más pequeño que resuelva la tarea. No mezclar refactors ni cambios de formato sin relación.
5. Mantener accesibilidad básica: controles semánticos, labels asociados, foco visible, navegación por teclado y mensajes de error comprensibles.
6. Gestionar correctamente autenticación, expiración de sesión y errores del backend. No almacenar ni exponer secretos en el código fuente.
7. Añadir o actualizar pruebas si existen para el flujo modificado y validar manualmente los estados que no estén cubiertos.
8. Ejecutar lint y build antes de solicitar revisión.
9. Revisar el diff completo y documentar cualquier decisión relevante.

## Comandos de validación

```powershell
npm run lint
npm run build
```

Para probar el flujo en desarrollo:

```powershell
npm run dev
```

El cambio no está listo si falla lint o build, salvo que el fallo sea previo y quede documentado.

## Convenciones

- Usar JavaScript/JSX, React y Vite según las versiones definidas en `package.json`.
- Respetar la configuración actual de ESLint y el React Compiler; no desactivar reglas para ocultar problemas.
- Reutilizar componentes, hooks y servicios existentes antes de crear duplicados.
- Mantener las llamadas HTTP dentro de `src/app/services` o la abstracción equivalente existente.
- Mantener la lógica de autenticación en los hooks y servicios existentes, no dispersarla en cada página.
- Usar CSS Modules cuando el flujo ya los utilice y preservar el diseño responsive.
- No editar `node_modules/` ni `dist/`.
- Si cambia un contrato de API, coordinar el cambio con `kanchay-backend` y actualizar ambos lados de forma compatible cuando sea posible.

## Revisión y entrega

Antes de abrir un pull request, comprobar:

- El flujo funciona en viewport desktop y móvil.
- Se contemplan carga, error, vacío y éxito cuando apliquen.
- Las rutas protegidas respetan el estado de autenticación y el rol del usuario.
- No hay errores de consola ni datos sensibles visibles.
- El diff contiene únicamente cambios relacionados.
- El pull request explica qué cambió, cómo se validó y cualquier variable de entorno necesaria.
