# RED SUPLEMENTOS — Entrega 4: sistema completo

RED SUPLEMENTOS es la tienda de suplementos que funciona adentro del gimnasio RED GYM (Rogelio Yrurtia 6028, Saavedra, CABA). Esta entrega completa el sistema: el backend en Express (MVC) tiene la lógica de negocio de punta a punta, y el frontend en React la usa entera, sin datos inventados en el navegador ni botones que simulen operaciones.

- **Sitio público:** catálogo con stock real, una página por producto, cuentas de cliente y «Mi cuenta» con el pedido en curso y el historial.
- **Panel del dueño:** pedidos con carrito y estados, productos, stock con su historial de movimientos, clientes y reportes.

**Cómo compra la gente (decisión del dueño).** Los clientes siguen pidiendo por mensaje directo de Instagram, como están acostumbrados. El dueño carga cada pedido en el panel. Con eso, el sistema:

- descuenta y reserva el stock;
- genera un código único;
- sigue los estados del pedido;
- aplica el descuento de socio;
- deja el pedido en el historial del cliente y en los reportes.

Si el cliente tiene cuenta, sigue el pedido desde «Mi cuenta» y puede cancelarlo mientras está pendiente.

## Ejecutar

Requisito: Node.js 22.22 o superior. Hacen falta dos terminales, desde la raíz del repositorio.

**Terminal 1, API:**

```bash
cd backend
npm ci
npm start
```

**Terminal 2, frontend:**

```bash
cd frontend
npm ci
npm run dev
```

Abrir la dirección que muestra Vite (normalmente `http://localhost:5173`).

- **Datos de demostración.** La API guarda todo en memoria y, al iniciar, carga datos de demostración: 10 productos, 3 clientes y 11 pedidos de los últimos días, en todos los estados. Al reiniciarla, vuelve a ese punto. Para arrancar vacía: `DATOS_DEMO=no npm start` (en PowerShell: `$env:DATOS_DEMO="no"; npm start`).
- **Pruebas del backend:** `npm test` en `backend/`.
- **Para ver los estados de carga:** crear `frontend/.env.local` con la línea `VITE_DEMORA_API_MS=800` y reiniciar `npm run dev`.
- **Si PowerShell no deja ejecutar `npm`** («la ejecución de scripts está deshabilitada»): usar `npm.cmd start` y `npm.cmd run dev`.

## Cuentas de demostración

| Perfil | Email | Contraseña |
|---|---|---|
| Dueño del local (administrador) | `admin@redsuplementos.com` | `RedAdmin2026` |
| Cliente, no es socio (Juan Pérez) | `cliente@example.com` | `Cliente2026` |
| Socia con membresía verificada: 10 % (Martina Gómez) | `socia@example.com` | `Cliente2026` |
| Dijo ser socia, falta verificarla (Sofía Ruiz) | `nueva@example.com` | `Cliente2026` |

- **Ingresar:** «Ingresar» en la barra, o `/ingresar`. En `npm run dev`, la pantalla de ingreso trae estas cuentas para completarlas con un clic.
- **Cuenta del dueño:** se crea al iniciar la API; no hay registro público de administradores. Se puede cambiar con las variables `ADMIN_EMAIL` y `ADMIN_CONTRASENA`.
- **Datos de demostración:** los nombres, emails (dominio reservado `example.com`), precios y stock son ficticios.

## El flujo de un pedido

1. Una clienta le escribe a @redsuplementos_ por Instagram. Si tiene cuenta, el botón «Comprar» de la página ya copia su email en el mensaje.
2. El dueño entra al panel. En **Pedidos → Nuevo pedido** arma el carrito: busca productos, los agrega y cambia cantidades. La API controla el stock en cada cambio.
3. Después elige a la clienta (o carga nombre e Instagram si no tiene cuenta), el día y la franja de retiro, y confirma.
4. La API registra el pedido (`RED-0012`), descuenta el stock con un movimiento de venta y, si es socia verificada, aplica el 10 %.
5. El dueño lo marca **listo para retirar**. La clienta lo ve así en «Mi cuenta».
6. Cuando lo retira y paga, el dueño lo marca **entregado** y la venta entra en **Reportes**.
7. Salidas alternativas:
   - el dueño lo cancela con un motivo y el stock vuelve;
   - la clienta lo cancela desde su cuenta mientras está pendiente;
   - si nadie lo retira, a las 48 h de la franja vence solo y el stock vuelve.

El guion del video recorre este flujo: [`docs/guion-video.md`](docs/guion-video.md).

## Qué cubre del análisis del sistema

### Funcionalidades

| | Funcionalidad | En el backend | En el frontend |
|---|---|---|---|
| F-01 | Registro e inicio de sesión | `/api/auth` (registro, login, logout, sesión) y `/api/perfil` | Ingresar, Crear cuenta, Mi cuenta → Tus datos |
| F-02 | Catálogo de productos (CRUD) | `/api/productos`, con baja lógica | Panel → Productos (alta, edición, baja) |
| F-03 | Catálogo público con filtros | `GET /api/productos` y `/api/categorias` | Inicio, Catálogo y página de producto |
| F-04 | Carrito y pedido con retiro | `/api/carrito` y `POST /api/pedidos` | Panel → Nuevo pedido |
| F-05 | Gestión de pedidos y estados | `PATCH /api/pedidos/:id/estado` | Panel → Pedidos y detalle del pedido |
| F-06 | Administración de stock | Descuento y devolución automáticos, `/api/productos/:id/movimientos` | Panel → Productos → Stock, y avisos de stock bajo |
| F-07 | Historial del cliente | `GET /api/pedidos` (el cliente ve los suyos) y `POST /api/pedidos/:id/repetir` | Mi cuenta (en curso e historial), «Repetir pedido» y «Repetir por Instagram» |
| F-08 | Reportes | `/api/reportes/ventas`, `mas-vendidos`, `cancelados` y `stock-critico` | Panel → Reportes |

### Reglas de negocio

| | Regla | Dónde se aplica |
|---|---|---|
| RN-01 | Sin vender sin stock ni más de lo que hay | `CarritoService` al agregar y cambiar; `PedidoService.create` lo vuelve a controlar al confirmar. Responde 409. |
| RN-02 | Solo con sesión se confirma un pedido | Middleware `authenticate` (401). Confirmar es del administrador. |
| RN-03 | Retiro de 7 a 22 h y no en fecha pasada | `utils/validatePedido.js` (`validateRetiro`) |
| RN-04 | El cliente cancela solo si está pendiente | `PedidoService.changeStatus` (403 o 409) |
| RN-05 | Cancelar devuelve el stock | `PedidoService` → movimiento `DEVOLUCION` |
| RN-06 | A las 48 h sin retirar, vence y libera stock | `PedidoService.expireOverdue`: antes de cada consulta y cada minuto desde `server.js` |
| RN-07 | Email único | `AuthService.registerClient` (409, sin distinguir mayúsculas) |
| RN-08 | Baja lógica | `ProductoService.delete`: el historial de pedidos conserva el producto |
| RN-09 | 10 % solo con membresía activa y verificada | `Cliente.tieneDescuento()`; la verifica el dueño en Panel → Clientes |
| RN-10 | Solo el administrador gestiona catálogo, precios y reportes | Middleware `authorize` (403) en cada ruta, y `RutaProtegida` en la interfaz |

### Validaciones

| | Validación | Archivo |
|---|---|---|
| V-01 | Obligatorios del registro y del producto | `validateRegistro.js`, `validateProducto.js` |
| V-02 | Formato de email y unicidad | `validarCuerpo.js` (`leerEmail`) y `AuthService` |
| V-03 | Contraseña de 8 o más, con letra y número, y confirmación | `validarCuerpo.js` (`contrasenaValida`), `validateRegistro.js` |
| V-04 | Cantidad entera mayor que 0 y no mayor al stock | `validateItemCarrito.js` y `CarritoService` |
| V-05 | Precio y stock | `validateProducto.js` y `validateMovimiento.js` |
| V-06 | Fecha y franja de retiro | `validatePedido.js` |
| V-07 | Teléfono: solo dígitos, de 8 a 15 | `validarCuerpo.js` (`leerTelefono`) |
| V-08 | Carrito no vacío | `PedidoService.create` |

El frontend repite estas reglas en los formularios para avisar antes de enviar (`utils/validarCuenta.js`, `utils/validarProducto.js` y las pantallas del panel). La última palabra la tiene siempre la API.

## Backend

Express 5 con las capas MVC de la Entrega 2, ampliadas:

```text
backend/src/
├── routes/        Una por recurso: qué método, qué middlewares y qué controlador
├── controllers/   Leen la solicitud y responden con ApiResponse; no tienen reglas de negocio
├── services/      La lógica: Auth, Cliente, Producto, Stock, Carrito, Pedido y Reporte
├── repositories/  Arrays en memoria; devuelven copias para que nadie modifique los datos por fuera
├── models/        Usuario, Cliente, Administrador, Producto, Categoria, Carrito, Pedido, DetallePedido, MovimientoStock y Sesion
├── middlewares/   authenticate, authorize, requireJson, methodNotAllowed, notFoundHandler y errorHandler
├── exceptions/    AppError y sus subclases (400, 401, 403, 404, 405, 409 y 415)
├── responses/     ApiResponse: { success, data } o { success: false, message }
├── enums/         Messages, EstadoPedido, TipoMovimiento, Rol y Negocio (horario, 48 h, 10 %)
├── utils/         Validaciones, fechas, importes en centavos, contraseñas (scrypt) y reloj
└── data/          Cuenta del dueño y datos de demostración
```

| Método y ruta | Acceso | Qué hace |
|---|---|---|
| `POST /api/auth/registro` | Público | Crea una cuenta de cliente y abre la sesión |
| `POST /api/auth/login` · `POST /api/auth/logout` · `GET /api/auth/sesion` | Público / con sesión | Iniciar, cerrar y consultar la sesión |
| `GET /api/perfil` · `PUT /api/perfil` | Cliente | Sus datos personales |
| `GET /api/productos` · `GET /api/productos/:id` · `GET /api/categorias` | Público | Catálogo |
| `POST /api/productos` · `PUT` y `DELETE /api/productos/:id` | Administrador | Alta, edición y baja lógica |
| `GET` y `POST /api/productos/:id/movimientos` | Administrador | Historial de stock, ingreso de mercadería y ajuste con motivo |
| `GET /api/carrito` · `DELETE /api/carrito` | Administrador | Ver (con `?idCliente=` muestra su descuento) y vaciar |
| `POST /api/carrito/items` · `PATCH` y `DELETE /api/carrito/items/:idProducto` | Administrador | Agregar, cambiar cantidades y quitar |
| `GET /api/pedidos` · `GET /api/pedidos/:id` | Con sesión | El administrador ve todos (`?estado=` y `?busqueda=`); el cliente, los suyos |
| `POST /api/pedidos` | Administrador | Confirma el carrito como pedido |
| `PATCH /api/pedidos/:id/estado` | Con sesión | Listo, entregado o cancelado con motivo. El cliente solo cancela si está pendiente |
| `POST /api/pedidos/:id/repetir` | Administrador | Carga los productos del pedido en el carrito, según el stock de hoy |
| `GET /api/clientes` · `PATCH /api/clientes/:id/membresia` | Administrador | Clientes y verificación de la membresía |
| `GET /api/reportes/ventas`, `mas-vendidos`, `cancelados` (`?desde=&hasta=`) y `stock-critico` | Administrador | Reportes |

**Errores, siempre con el mismo formato:**

| Código | Cuándo |
|---|---|
| 400 | Datos inválidos |
| 401 | Sin sesión o sesión vencida |
| 403 | Perfil sin permiso |
| 404 | No existe |
| 405 | Método no permitido |
| 409 | Conflicto de negocio: stock insuficiente, duplicado, email repetido o estado que no admite el cambio |
| 413 | Cuerpo demasiado grande |
| 415 | No es JSON |
| 500 | Error interno, sin detalles |

Ejemplos listos para probar: [`docs/solicitudes.http`](docs/solicitudes.http). Recorrido de una solicitud y decisiones: [`docs/arquitectura.md`](docs/arquitectura.md).

## Frontend

| Ruta | Pantalla | Acceso |
|---|---|---|
| `/` · `/catalogo` · `/catalogo/:id` | Inicio, catálogo y página de producto (Entrega 3) | Público |
| `/ingresar` · `/registro` | Ingresar y crear cuenta | Público |
| `/mi-cuenta` | Pedido en curso (con sus pasos), historial, cancelar si está pendiente, repetir por Instagram y datos personales | Cliente |
| `/admin/pedidos` | Bandeja: vistas por estado con contadores, búsqueda y el paso siguiente en cada fila | Dueño |
| `/admin/pedidos/nuevo` | Carrito contra la API, cliente con o sin cuenta, día y franja, confirmación | Dueño |
| `/admin/pedidos/:id` | Detalle, historial de estados, marcar listo o entregado, cancelar con motivo y repetir | Dueño |
| `/admin/productos` (+ `nuevo` y `:id/editar`) | Catálogo del panel (Entrega 3) | Dueño |
| `/admin/productos/:id/stock` | Ingreso de mercadería, ajuste con motivo e historial de movimientos | Dueño |
| `/admin/clientes` | Clientes con cuenta y verificación de la membresía | Dueño |
| `/admin/reportes` | Cifras del período, ventas por día, más vendidos, stock crítico y cancelados | Dueño |

- **Peticiones:** todas pasan por `src/services`, una función por operación: `authService`, `productosService`, `categoriasService`, `carritoService`, `pedidosService`, `stockService`, `clientesService` y `reportesService`. `fetch` aparece en un solo archivo, `apiClient.js`, que además envía el token de la sesión. Si la API responde 401, cierra la sesión en toda la app y avisa.
- **Sesión:** `context/SesionProvider.jsx` guarda quién ingresó, y `components/layout/RutaProtegida.jsx` cuida las pantallas privadas:
  - sin sesión, lleva a «Ingresar» y después vuelve a la pantalla pedida;
  - con otro perfil, lleva al inicio de ese perfil.

  Ocultar pantallas es solo comodidad: la API vuelve a controlar el permiso en cada solicitud.
- **Estados:** las pantallas muestran skeletons al cargar, un error con «Reintentar», un estado vacío que explica qué hacer y un aviso al terminar cada acción. Los errores de la API se muestran en el campo o junto al botón.
- **Componentes nuevos reutilizables:** `Segmentos`, `CampoCantidad`, `CheckboxField`, `BotonMensajeInstagram`, `EncabezadoPublico`, `EstadoPedidoBadge`, `PasosPedido`, `ResumenImportes`, `DetalleProductos`, `HistorialPedido`, `GraficoVentas` y `RankingProductos`, más el hook `useRecurso`.

## Decisiones de esta entrega

| Decisión | Motivo |
|---|---|
| Los pedidos llegan por Instagram y los registra el dueño | Así trabaja el local y así lo pidió el dueño. El carrito es del administrador. «Comprar» sigue abriendo el chat de Instagram y, con sesión, el mensaje lleva el email del cliente para registrar el pedido a su nombre. |
| Pedido de un cliente con cuenta o sin cuenta | Muchos piden por Instagram sin registrarse. Sin cuenta se guarda su nombre y su Instagram o teléfono. El descuento (RN-09) es solo para clientes registrados y verificados. |
| El stock se reserva al confirmar | El análisis dice que el pedido pendiente reserva el stock. Cada cambio queda como movimiento: `VENTA` al confirmar, `DEVOLUCION` al cancelar o vencer, `INGRESO` y `AJUSTE` desde el panel. |
| La edición de un producto ya no cambia el stock | Si el formulario mandara el stock que cargó al abrirse, borraría una venta registrada mientras estaba abierto. Ahora el stock se mueve con ingresos y ajustes, que quedan en el historial. La API sigue aceptando `stock` en el `PUT`, como en la Entrega 2, y registra la diferencia como `AJUSTE`. |
| Precios congelados en cada línea del pedido | Si después cambia el precio o el nombre de un producto, el historial y los reportes no se alteran. |
| Importes en centavos | Sumar `25000.50` varias veces con decimales acumula errores; los centavos son enteros. |
| Franjas de una hora y hasta 30 días de anticipación | El análisis pide día y franja. El tope de 30 días es una validación agregada para evitar fechas mal tipeadas. |
| Sesión con token aleatorio guardado en la API | Vence a las 8 horas. Las contraseñas se guardan con `scrypt` (incluido en Node, sin dependencias nuevas) y nunca salen en las respuestas. |
| Vencimiento a las 48 h | Se revisa antes de cada consulta de pedidos y reportes, y cada minuto desde `server.js`. |
| Datos en memoria, con demostración al iniciar | Es el almacenamiento de la Entrega 2. Los datos de demostración se cargan con los mismos servicios, con el reloj fijado en días anteriores: cumplen todas las reglas y dejan historia para los reportes. |
| Reloj inyectable | Las pruebas fijan la fecha y adelantan horas para probar el vencimiento de pedidos y de sesiones. |

## Verificación

Detalle en [`docs/verificacion.md`](docs/verificacion.md).

- **Backend:** 101 pruebas con `node --test`, todas aprobadas. Son las 24 de la Entrega 2, adaptadas a la sesión, y 77 nuevas, al menos una por regla y validación del análisis.
- **Recorrido real en Chrome:** 36 de 36 pasos aprobados, con la API, Vite y la consola sin errores.
- **Accesibilidad:** axe (WCAG 2.2 A y AA) sin violaciones en las 12 pantallas nuevas, en escritorio y en teléfono.
- **Código:** ESLint sin observaciones y build de producción correcto.

## Experiencia de uso y accesibilidad

- **Carga:** skeletons con la forma del contenido final y botones con estado («Guardando…», «Confirmando…»). Al cambiar un filtro o un período, la pantalla conserva lo anterior atenuado en lugar de saltar.
- **Avisos:** éxitos y errores pasan por un único sistema de avisos laterales (Sonner, a través de `utils/notify.js`). Cuando falla una carga, además hay un estado en pantalla con «Reintentar».
- **Confirmaciones:** diálogo sobre `<dialog>` nativo para dar de baja y para cancelar pedidos. Cancelar desde el panel pide el motivo, que queda en el historial.
- **Formularios:** cada `label` está asociado a su campo, los errores se anuncian con `aria-invalid` y `aria-describedby`, y al enviar con errores el foco va al primero.
- **Navegación:** enlace para saltar al contenido, un solo `h1` por pantalla, título de pestaña por ruta y foco en el título al cambiar de pantalla. Todo se usa con teclado, incluido el gráfico de ventas (con flechas) y sus datos en tabla.
- **Contraste:** AA comprobado con axe. Los estados llevan texto e ícono, nunca solo color.

## Movimiento

El sitio público toma el lenguaje de los grandes gimnasios: fondo negro, fotos grandes, títulos enormes y mucho movimiento. Lo propio es el motivo: **la inclinación de 7° del «RED» del logo**, medida en sus trazos, es el corte de las fotos, los botones, el telón entre pantallas y los barridos.

- **Momento principal:** al bajar, la fachada real se abre en una ventana inclinada hasta llenar la pantalla, y se entra al gimnasio.
- **Al cargar:** un telón se corre, los títulos suben renglón por renglón y la foto del hero se abre.
- **Solas:** tres fotos reales rotan en el hero y una marquesina cruza la pantalla con datos del negocio.
- **Con el scroll:** la barra queda fija arriba (transparente sobre el hero, negra al bajar), las filas de fotos se cruzan y el logo del footer termina de crecer.
- **Del catálogo a un producto:** la imagen de la tarjeta viaja hasta la página del producto.
- **Con el mouse:** cada sección de la barra se barre con un bloque claro a 7° y su texto rueda; hay barridos en los botones y vistas previas que siguen al puntero.

Cada una tiene sus límites:

- **Se puede parar:** el botón «Pausar animaciones» detiene lo que se mueve solo y se recuerda entre visitas.
- **Movimiento reducido:** con `prefers-reduced-motion` no hay telón ni bucles, y el escenario es una foto fija.
- **Pantallas táctiles:** ningún hover se queda pegado.
- **Panel de administración:** sin nada de esto. Se usa todos los días y ahí la animación estorba; solo responden los controles al presionarlos.

No se agregó ninguna biblioteca: son transiciones y animaciones CSS, más unos pocos hooks propios.

## Mejoras y excepciones justificadas

### Respecto del boceto, la Propuesta y el análisis

| Cambio | Motivo |
|---|---|
| WhatsApp pasa a mensaje directo de Instagram | Decisión del negocio: ya no usa WhatsApp. El análisis lo mencionaba para avisar que el pedido está listo; ahora el cliente lo ve en «Mi cuenta». |
| El pedido lo registra el dueño | Decisión del dueño: sus clientes ya le piden por Instagram. La matriz de permisos del análisis dejaba al cliente crear pedidos; acá el cliente los sigue, los cancela mientras están pendientes y repite compras por Instagram. |
| «Comprar» copia la consulta y abre el chat | Los enlaces de mensaje directo de Instagram no permiten dejar el texto escrito. Un aviso indica que hay que pegarla. |
| Texto negro sobre el naranja, no blanco | Blanco sobre #d47e30 da 3,1:1 y no cumple AA; negro da 6,8:1. |
| Sitio público en negro, con productos y catálogo en gris | Los sitios de los grandes gimnasios son negros. El negro hace de campo y el gris queda donde se elige y se compra. |
| Hero a toda la pantalla, marquesina, galería y «Sobre nosotros» en dos tiempos | Mantienen el orden de los 5 bloques del boceto, con la presencia de los sitios de gimnasios. |
| Catálogo, página de producto, cuentas y panel | No están en el wireframe, pero sí en el análisis del sistema (F-01 a F-08). |

### Respecto de las reglas de diseño aplicadas

| Excepción | Motivo |
|---|---|
| El verificador de diseño marca el naranja como «terracota» (se corre con `--allow palette-terracotta`) | Es el color de marca de la Propuesta, y el fondo es gris neutro, no crema. |
| Sin video en la página | No hay ningún video real del local, y uno de stock lo representaría mal. |
| Ingresar y Crear cuenta tienen 2 fotos (el verificador pide 4) | Son pantallas de formulario: una foto real del local acompaña la tarea y una galería la distraería. |
| Filas de tarjetas de producto | La grilla la exige el boceto y muestra contenido real. |

## Imágenes

| Material | Origen |
|---|---|
| Fotos del gimnasio y del stock | Instagram de RED GYM, aportadas por el negocio (`docs/marca/fotos/`), recortadas y comprimidas a WebP. |
| Fotos de 3 productos | Recortes de la foto real del stock. Se referencian por el campo `imagen` de la API. |
| Logo | Vectorizado desde `docs/marca/logo-original.jpg` en variantes positiva, negativa, compacta y sticker. El JPG original no se sirve en la web. |
| Productos sin foto | Ilustración geométrica del envase, por categoría. |
| Glifo de Instagram | Simple Icons (CC0). |

## Pendiente antes de publicar

- **Persistencia:** los datos viven en memoria. Para usarlo de verdad hace falta una base de datos; cada repositorio se reemplaza sin tocar los servicios.
- **Contraseña del dueño:** cambiar `ADMIN_EMAIL` y `ADMIN_CONTRASENA`, que hoy tienen valores de demostración públicos.
- **Datos de demostración:** precios, stock, clientes y pedidos son ficticios.
- **Fotos de producto:** 7 de los 10 productos de demo usan la ilustración.
- **Elegir los productos estrella:** la portada los elige por stock y categoría. La API no tiene un campo para destacarlos a mano.

## Más documentación

- [`docs/guion-video.md`](docs/guion-video.md): guion del video de la Entrega 4.
- [`docs/verificacion.md`](docs/verificacion.md): pruebas y resultados.
- [`docs/arquitectura.md`](docs/arquitectura.md): arquitectura del backend y recorrido de una solicitud.
- [`docs/solicitudes.http`](docs/solicitudes.http): solicitudes de ejemplo de toda la API.
- [`docs/entrega-2-backend.md`](docs/entrega-2-backend.md): API de productos, campos y códigos de error (Entrega 2).
- [`docs/entrega-1-dominio/`](docs/entrega-1-dominio/): las clases de dominio de la Entrega 1.
- `docs/capturas/`: capturas del sitio (`boceto-vs-sitio.jpg` compara los 5 bloques con el boceto).
- `frontend/README.md`, `frontend/DESIGN.md` y `frontend/PRODUCT.md`: comandos, sistema visual y contexto de producto.
