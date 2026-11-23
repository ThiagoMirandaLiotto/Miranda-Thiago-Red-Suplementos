# Guion del video: un pedido de punta a punta

**Duración:** unos 8 minutos (la consigna pide entre 5 y 10).

**Flujo:** un pedido que llega por Instagram, desde que el dueño lo carga hasta que entra en los reportes.

**Partes:** la interfaz, el frontend (React) y el backend (Express, MVC).

## Antes de grabar

- **Pantalla:** el escritorio limpio, con VS Code abierto en la carpeta del repositorio y el navegador al lado.
- **Terminales:** dos, una en `backend` y otra en `frontend`, todavía sin iniciar.
- **Pestañas en VS Code**, en este orden:
  1. `backend/src/routes/pedidoRoutes.js`
  2. `backend/src/controllers/PedidoController.js`
  3. `backend/src/services/PedidoService.js` (en `create`)
  4. `backend/src/utils/validatePedido.js`
  5. `backend/src/services/StockService.js`
  6. `backend/src/middlewares/errorHandler.js`
  7. `frontend/src/services/pedidosService.js`
  8. `frontend/src/services/apiClient.js`
  9. `frontend/src/pages/AdminNuevoPedidoPage.jsx` (en `confirmar`)
- **Navegador:** una ventana normal (será la del dueño) y otra de incógnito (será la de la clienta).
- **Cuentas:** están en el README. Dueño: `admin@redsuplementos.com` / `RedAdmin2026`. Socia: `socia@example.com` / `Cliente2026`.
- **Ensayo:** hacerlo una vez entero. Si algo sale distinto, reiniciar la API (`Ctrl+C` y `npm start`) devuelve los datos al punto de partida.

## 1. Presentación (0:00 a 0:40)

**En pantalla:** el inicio del sitio.

> «Soy Thiago Miranda y este es RED SUPLEMENTOS, la tienda de suplementos que está adentro de RED GYM. En esta entrega completé el sistema: backend en Express con arquitectura MVC y frontend en React, conectados. Voy a mostrar un flujo completo, el de un pedido. Por pedido del dueño, los clientes siguen pidiendo por Instagram, como están acostumbrados. Él carga el pedido en el panel, y desde ahí el sistema controla el stock, los estados, el descuento de socios, el historial del cliente y los reportes.»

## 2. Arranque y estructura (0:40 a 1:30)

**En pantalla:** las dos terminales y el árbol de carpetas de `backend/src`.

1. En la terminal del backend, `npm start`. Se ve «Datos de demostración cargados» y «API RED SUPLEMENTOS iniciada en el puerto 3000».
2. En la del frontend, `npm run dev`.
3. Mostrar las carpetas de `backend/src`.

> «La API mantiene las capas de la Entrega 2:
> - **rutas:** qué método llega y con qué controles;
> - **controladores:** leen la solicitud y responden;
> - **servicios:** toda la lógica de negocio;
> - **repositorios:** guardan los datos en arrays en memoria;
> - **modelos:** son las clases del dominio de la Entrega 1;
> - además, middlewares, excepciones y respuestas.
>
> Al iniciar carga datos de demostración con los mismos servicios: diez productos, tres clientes y pedidos de los últimos días.»

## 3. El dueño arma el pedido (1:30 a 3:00)

**En pantalla:** el navegador.

1. «Ingresar» → completar los datos del dueño. Entra a **Pedidos**.
   > «Solo el administrador entra al panel. La bandeja muestra lo que está en curso: dos pendientes y uno listo para retirar.»
2. **Nuevo pedido.** Buscar «creatina» → **Agregar** la creatina monohidrato. Buscar «bar» → **Agregar** dos veces la Protein Bar.
   > «Cada vez que agrego, el frontend le pide a la API que lo sume al carrito, y la API controla el stock real.»
3. En la creatina del carrito, escribir **99** y apretar Enter. Aparece el error.
   > «Si pido más de lo que hay, la API responde 409 con el motivo. Es la regla RN-01, y el carrito no cambia.»
4. La cantidad vuelve sola a 1. Elegir la clienta «Gómez, Martina · socio, 10 %». Aparece el descuento.
   > «Martina es socia de RED GYM con la membresía verificada: la API le aplica el 10 %.»
5. Día: mañana. Franja: «de 18 a 19 h». **Confirmar pedido.**
   > «Se registró el RED-0012. El aviso dice que el stock quedó reservado.»

## 4. Qué pasó en el backend (3:00 a 5:00)

**En pantalla:** VS Code, una pestaña por vez.

1. **`pedidoRoutes.js`:**
   > «El POST pasa primero por `autenticar`, que valida el token de la sesión, después por `soloAdmin` y después por `requireJson`. Sin sesión respondería 401; con la sesión de un cliente, 403.»
2. **`PedidoController.create`:**
   > «El controlador no tiene lógica: llama al servicio y responde 201 con el formato de siempre, `success` y `data`.»
3. **`PedidoService.create`**, recorriéndolo de arriba abajo:
   > - «Primero vence los pedidos que pasaron 48 horas sin retirarse.
   > - Valida el cuerpo, con `validatePedido`: el cliente, y que la fecha no sea pasada y la franja esté entre las 7 y las 22.
   > - Si el carrito está vacío, error.
   > - Vuelve a controlar el stock de cada línea, porque pudo cambiar desde que armé el carrito. Hasta acá no modificó nada: si algo falla, el pedido no existe.
   > - Copia nombre y precio a cada línea, así el historial no cambia si después cambia el catálogo.
   > - Suma en centavos y aplica el 10 % solo si la clienta tiene la membresía verificada.
   > - Guarda el pedido: el repositorio le asigna el código.
   > - Por cada línea registra un movimiento de stock de tipo VENTA.»
4. **`StockService.registerMovement`:**
   > «Todo cambio de stock pasa por acá. Si quedara negativo, error 409; si no, actualiza el producto y deja el movimiento con fecha, cantidad, usuario y pedido.»
5. **`errorHandler.js`:**
   > «Los errores se lanzan como AppError con su código, y este único middleware arma la respuesta: `success: false` y el mensaje. Por eso todos los errores tienen el mismo formato.»

## 5. Qué pasó en el frontend (5:00 a 6:00)

1. **`pedidosService.js`:**
   > «Cada operación del backend tiene su función acá. La pantalla nunca llama a `fetch` directamente.»
2. **`apiClient.js`:**
   > «Es el único archivo con `fetch`. Agrega el token, convierte las respuestas de error en `ApiError` con el mensaje de la API y, si la sesión vence, la cierra en toda la app.»
3. **`AdminNuevoPedidoPage.jsx`**, en `confirmar`:
   > «La pantalla valida lo mismo que la API para avisar antes de enviar. Si la API rechaza algo, muestra su mensaje junto al botón y en un aviso. Si sale bien, muestra el código, avisa si algún producto quedó bajo el mínimo y abre el pedido.»

## 6. El pedido sigue su camino (6:00 a 7:30)

**En pantalla:** el navegador.

1. En el detalle del RED-0012, **Marcar listo para retirar**.
   > «Cada cambio queda en el historial, con quién y cuándo.»
2. En la ventana de incógnito, ingresar como la socia. Abre **Mi cuenta**.
   > «La clienta ve su pedido listo para retirar, con los pasos, el detalle y el descuento. Mientras está pendiente lo podría cancelar; ya listo, no: la API responde 409 (regla RN-04).»
3. Volver a la ventana del dueño → **Marcar entregado** → abrir **Reportes**.
   > «Cuando lo retira y paga, el pedido se marca entregado y cuenta como venta. Acá están las ventas del período, los más vendidos y el stock crítico, con acceso directo a cargar mercadería.»
4. **Productos** → **Stock** de la creatina.
   > «Este es el historial del producto: el stock inicial, cada venta con su pedido y los ingresos. El stock nunca se pisa a mano.»

## 7. Validaciones y pruebas (7:30 a 8:20)

1. Cerrar sesión. En **Crear cuenta**, usar un email que ya existe: `cliente@example.com`.
   > «El email es único (RN-07): la API responde 409 y el formulario lo marca en el campo.»
2. En la terminal del backend, cortar con `Ctrl+C` y correr `npm test`.
   > «Hay 101 pruebas automáticas, al menos una por regla y validación del análisis. Pasan todas.»

## 8. Cierre (8:20 a 8:40)

> «Eso es el flujo completo: catálogo, carrito, pedido con retiro, estados, stock, historial del cliente y reportes. La lógica vive en el backend, y el frontend la usa entera a través de sus servicios. Gracias.»
