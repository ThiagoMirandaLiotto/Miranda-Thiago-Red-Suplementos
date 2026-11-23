# Arquitectura del backend

La API se armó en la Entrega 2 con un CRUD de Producto, y en la Entrega 4 suma la lógica de negocio completa del análisis del sistema. Mantiene las mismas capas y el mismo formato de respuesta.

## Capas

| Capa | Qué hace | Qué no hace |
| --- | --- | --- |
| `routes` | Asocia cada método y ruta con sus middlewares y su controlador. Responde 405 a los métodos no admitidos. | No lee el cuerpo ni decide reglas. |
| `middlewares` | `authenticate` exige una sesión vigente (401), `authorize` limita por perfil (403) y `requireJson` exige JSON (415). `errorHandler` arma todas las respuestas de error. | No conoce pedidos ni productos. |
| `controllers` | Toma los parámetros (con `parseId` para los IDs), llama al servicio y responde con `ApiResponse`. | No valida reglas ni guarda datos. No usa try/catch: Express 5 lleva los errores al `errorHandler`. |
| `services` | Toda la lógica: validaciones, reglas de negocio, estados, stock, descuentos y reportes. Lanzan `AppError` con el mensaje de `Messages`. | No usan objetos de Express. |
| `repositories` | Guardan y leen los arrays en memoria. Asignan IDs y el código del pedido. Devuelven copias, para que nadie cambie los datos sin pasar por un servicio. | No deciden si algo se puede vender. |
| `models` | Las entidades del dominio (las clases de la Entrega 1) con consultas simples sobre su propio estado: `hayStock`, `requiereReposicion`, `tieneDescuento`, `vencimiento`. | No acceden a otras entidades. |
| `utils` | Validan la forma de cada cuerpo (`validate*.js`), manejan fechas, importes en centavos, contraseñas y el reloj. | No acceden a los repositorios. |

Las instancias se crean una sola vez en `createApp()` y se pasan por constructor. Esa función recibe el reloj (para fijar la hora en las pruebas) y la cuenta del dueño.

## Recorrido de una solicitud: confirmar un pedido

`POST /api/pedidos` con `{ idCliente: 3, fechaRetiro: "2026-11-25", horaRetiro: "18:00" }`:

1. **`pedidoRoutes`:** el router aplica `authenticate`, que lee `Authorization: Bearer <token>`, busca la sesión y deja el usuario en `req.usuario`. Después aplica `authorize(ADMINISTRADOR)` y `requireJson`.
2. **`PedidoController.create`:** llama a `pedidoService.create(req.usuario, req.body)`, pone el encabezado `Location` y responde 201 con `ApiResponse.success`.
3. **`PedidoService.create`:**
   - vence los pedidos atrasados (RN-06);
   - valida el cuerpo con `validatePedido`: un cliente registrado o uno sin cuenta, y fecha y franja dentro de las reglas RN-03 y V-06;
   - controla que el carrito no esté vacío (V-08) y que el cliente exista;
   - **vuelve a controlar el stock de cada línea**, porque pudo cambiar desde que se armó el carrito (RN-01). Hasta acá no se modificó nada: si algo falla, responde 409 y el pedido no existe.
4. **Importes:** se copian nombre y precio de cada producto a las líneas (`DetallePedido`). Se suman en centavos y se aplica el 10 % solo si `Cliente.tieneDescuento()` (RN-09).
5. **`PedidoRepository.create`:** asigna el ID y el código único `RED-0001`, y guarda el historial con el primer estado: pendiente, quién y cuándo.
6. **`StockService.registerMovement`:** por cada línea registra una `VENTA` con cantidad negativa, el stock resultante, el usuario y el pedido. Si un producto queda bajo el mínimo, la respuesta lo incluye en `alertasStock` (F-06).
7. **Cierre:** se vacía el carrito del administrador y se responde `{ success: true, data: { pedido, alertasStock } }`.

Si en cualquier paso se lanza un `AppError`, el `errorHandler` responde `{ success: false, message }` con su código: 400, 401, 403, 404 o 409.

## Estados del pedido

```text
PENDIENTE ──▶ LISTO_PARA_RETIRAR ──▶ ENTREGADO
    │                 │
    └─────────────────┴──▶ CANCELADO (con motivo; devuelve el stock)
    └─────────────────┴──▶ VENCIDO   (48 h después de la franja; devuelve el stock)
```

Quién puede hacer cada cambio, en `PedidoService.changeStatus`:

- **El administrador:**
  - marca listo un pedido pendiente;
  - marca entregado uno que ya está listo (si no, responde 409 «Primero marcá el pedido como listo para retirar»);
  - cancela cualquiera que esté en curso, con un motivo de al menos 5 caracteres.
- **El cliente:** solo cancela, y solo mientras el pedido está pendiente (RN-04). Si pide otro estado responde 403; si ya está listo, 409.
- **El sistema:** pasa a vencido lo que nadie retiró.
- **Pedido cerrado:** entregado, cancelado o vencido no admite cambios (409).

Cada cambio se agrega al `historial` del pedido con el estado, la fecha, el usuario (o «Sistema») y la nota. Es la relación Administrador → Pedido gestionado del Anexo B.

## Stock

El stock nunca se escribe directo: todo pasa por `StockService.registerMovement`, que rechaza un resultado negativo (409) y deja un `MovimientoStock`.

| Tipo | Lo genera | Cantidad |
| --- | --- | --- |
| `INGRESO` | El alta de un producto («Stock inicial») o el panel («Ingreso de mercadería») | Positiva |
| `AJUSTE` | El panel, con motivo obligatorio, o un `PUT` de producto que trae otro stock | Positiva o negativa |
| `VENTA` | La confirmación de un pedido | Negativa |
| `DEVOLUCION` | La cancelación o el vencimiento de un pedido | Positiva |

## Sesión y permisos

- **Registro:** crea siempre un `Cliente`. La única cuenta de administrador se crea al iniciar la API (`data/cuentaAdministrador.js`).
- **Contraseñas:** se guardan con `scrypt` y sal aleatoria. Se comparan en tiempo constante, y con un email inexistente también se calcula un hash, para no revelar qué cuentas existen. `Usuario.toJSON()` nunca incluye el hash.
- **Sesiones:** cada inicio de sesión genera un token aleatorio de 32 bytes que vence a las 8 horas, guardado en `SesionRepository`. El cierre de sesión lo borra.
- **Pedidos ajenos:** un cliente que pide el pedido de otra persona recibe 404, no 403, para no confirmar que existe.

## Tiempo

`utils/reloj.js` es la única fuente de la hora actual de los servicios:

- **En producción** devuelve la hora real.
- **En las pruebas** se fija en una fecha conocida y se adelanta, por ejemplo 48 h para el vencimiento o 8 h para la sesión.
- **Los datos de demostración** lo fijan en días anteriores y cargan los pedidos con los mismos servicios que usa la API. Así cumplen todas las reglas y dejan historia para los reportes.

Las fechas de retiro se guardan como `AAAA-MM-DD` y la franja como `HH:00`, en la hora local del servidor (el local está en Buenos Aires).

## Decisiones de alcance

1. **Pedidos registrados por el dueño.** Los clientes piden por Instagram (decisión del negocio). El carrito es del administrador y uno por usuario. El pedido puede ser de un cliente registrado (`idCliente`) o de alguien sin cuenta (nombre e Instagram o teléfono).
2. **Persistencia en memoria**, como en la Entrega 2. Reemplazar un repositorio por una base de datos no cambia los servicios.
3. **Baja lógica (RN-08).** El listado y la consulta por ID muestran solo productos activos. Un producto dado de baja sigue en los pedidos que lo incluyeron.
4. **`PUT` de producto.** Reemplaza los atributos editables. El `stock` pasó a ser opcional: sin él se conserva el actual, y si llega distinto la diferencia queda como `AJUSTE`.
5. **Unicidad.** Nombre, marca, sabor y categoría, para productos activos (Entrega 2). Email, sin distinguir mayúsculas, para cuentas (RN-07).
6. **Reportes.** Una venta es un pedido entregado (se paga al retirar). Se agrupa por día de entrega, y «más vendidos» suma unidades entregadas a precio de lista.

## Correspondencia con la evaluación

| Criterio | Evidencia |
| --- | --- |
| Lógica de negocio implementada correctamente | `services/`: Auth, Cliente, Producto, Stock, Carrito, Pedido y Reporte, con las reglas RN-01 a RN-10 |
| Separación de capas MVC | Cada recurso tiene su ruta, su controlador, su servicio y su repositorio. La tabla de arriba dice qué hace cada capa y qué no |
| Validaciones en el backend | `utils/validate*.js` (forma y formato) y los servicios (stock, duplicados, inexistentes, estados). Una prueba por validación |
| Manejo centralizado de errores | `AppError` y sus subclases, `Messages` y un único `errorHandler` |
| Formato de respuesta consistente | `ApiResponse`. Las pruebas verifican las claves exactas de cada respuesta (`data`/`success` o `message`/`success`) |
| Integración con el frontend | Cada endpoint tiene su función en `frontend/src/services` y su pantalla (README, sección Frontend) |
| Funcionamiento general | `npm test`: 101 pruebas aprobadas. El recorrido en el navegador está en `docs/verificacion.md` |
