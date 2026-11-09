# RED SUPLEMENTOS — Entrega 3: Frontend

Interfaz en React de RED SUPLEMENTOS, la tienda de suplementos que funciona adentro del gimnasio RED GYM (Rogelio Yrurtia 6028, Saavedra, CABA). Tiene un sitio público que respeta el orden del boceto y toma el lenguaje de los sitios de los grandes gimnasios, y un panel de gestión de productos, ambos conectados a la API de la Entrega 2.

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

La API guarda los datos en memoria y arranca sin productos. Para ver el sitio con contenido, con la API iniciada, ejecutar desde la raíz:

```bash
node docs/cargar-demo.mjs
```

Al reiniciar la API se pierden los productos: hay que volver a cargarlos.

**Para ver los estados de carga en la corrección:** crear `frontend/.env.local` con la línea `VITE_DEMORA_API_MS=800` y reiniciar `npm run dev`. La API local responde tan rápido que, sin esa demora, casi no se ven.

## Pantallas

| Ruta | Pantalla | Qué hace |
|---|---|---|
| `/` | Inicio | Los 5 bloques del boceto, en su orden: navegación, hero, sobre nosotros, productos estrella y footer. |
| `/catalogo` | Catálogo | Todos los productos, con búsqueda, filtros por categoría y marca, orden por precio y «Solo con stock». |
| `/catalogo/:id` | Producto | La página de cada producto: precio, disponibilidad, compra por Instagram, cómo se compra y más productos. Se llega tocando cualquier tarjeta. |
| `/admin/productos` | Panel | Listado con búsqueda, filtros y baja con confirmación. Se llega desde «Administrar productos» en el footer. |
| `/admin/productos/nuevo` | Alta | Formulario con validación. |
| `/admin/productos/:id/editar` | Edición | El mismo formulario, precargado. |
| cualquier otra | 404 | Página de «no encontrada». |

El panel no pide inicio de sesión porque la API todavía no implementa autenticación (RN-10 sigue pendiente en el backend).

## Estructura

```text
Miranda-Thiago-Red-Suplementos/
├── backend/        API de la Entrega 2, sin modificar
├── docs/           Documentación, datos de demo, capturas, material de marca y el dominio de la Entrega 1
└── frontend/
    ├── public/     Favicon y fotos de producto, que la API referencia por ruta
    └── src/
        ├── assets/       Logo, fotos e íconos
        ├── components/
        │   ├── ui/        Piezas genéricas: Button, campos, Badge, Skeleton, ConfirmDialog, Logo…
        │   ├── layout/    Navbar, Footer, layouts, foco entre rutas, ErrorBoundary
        │   ├── landing/   Hero, Marquesina, SobreNosotros, GaleriaGimnasio, ProductosEstrella
        │   └── productos/ ProductoCard, ProductoDestacado, IndiceCategorias, ProductoForm, ProductoTabla, filtros…
        ├── hooks/         Datos (useProductos, useCategorias…) y movimiento (useRotacion, usePuntero, useMarquesina…)
        ├── pages/         Una por pantalla
        ├── services/      Comunicación con la API
        ├── styles/        tokens.css y global.css
        ├── utils/         Validación, formatos, stock, filtros, Instagram, avisos, datos del negocio
        ├── App.jsx        Rutas y sistema de avisos
        └── main.jsx       Punto de entrada
```

`hooks/` es la única carpeta agregada a la estructura sugerida. Los hooks de React no son pantallas, ni componentes, ni funciones auxiliares comunes, y separarlos deja a cada carpeta con una sola responsabilidad.

## Conexión con la API

Todas las peticiones pasan por `src/services`. `fetch` aparece en un solo archivo, `apiClient.js`, que arma la URL, envía el JSON, detecta respuestas incorrectas y lanza `ApiError`. `productosService.js` y `categoriasService.js` exponen una función por operación.

| Endpoint | Dónde se usa |
|---|---|
| `GET /api/productos` | Inicio, catálogo y panel |
| `GET /api/productos/:id` | Página de producto y edición |
| `POST /api/productos` | Alta |
| `PUT /api/productos/:id` | Edición |
| `DELETE /api/productos/:id` | Baja desde el panel |
| `GET /api/categorias` | Inicio, catálogo, panel y formulario |

**Por qué no se llama directo a `http://localhost:3000`, como en el ejemplo de la consigna.** La API de la Entrega 2 no habilita CORS, así que el navegador bloquearía las peticiones desde el puerto de Vite. En lugar de modificar el backend, `vite.config.js` define un proxy: el frontend le pide a `/api` y Vite lo reenvía a `http://127.0.0.1:3000`. La URL sigue configurada en un solo lugar y se puede cambiar con `VITE_API_URL`.

**Por qué los productos se validan también en el formulario.** `utils/validarProducto.js` aplica las mismas reglas que la API para mostrar el error en el campo antes de enviar. `utils/productoPayload.js` arma el cuerpo con exactamente los 9 campos que acepta la API y con los números como `number`. Si la API rechaza algo igual, como un duplicado (409), el error también se muestra.

## Experiencia de uso y accesibilidad

- **Carga:** skeletons con la forma del contenido final y botones con estado («Guardando…», «Dando de baja…»).
- **Avisos:** éxitos y errores pasan por un único sistema de avisos laterales (Sonner, a través de `utils/notify.js`). Cuando falla una carga, además hay un estado en pantalla con «Reintentar».
- **Baja:** diálogo de confirmación sobre `<dialog>` nativo, con el foco inicial en «Cancelar». La API hace baja lógica, por eso el botón dice «Dar de baja».
- **Formularios:** cada `label` está asociado a su campo, los errores se anuncian con `aria-invalid` y `aria-describedby`, y al enviar con errores el foco va al primero.
- **Navegación:** enlace para saltar al contenido, un solo `h1` por pantalla, título de pestaña por ruta y foco en el título al cambiar de pantalla. Todo se puede usar con teclado.
- **Contraste:** AA comprobado con axe en las pantallas. El texto que va sobre fotos, que axe no evalúa, se midió contra el píxel más desfavorable de cada foto. Los estados llevan texto e ícono (nunca solo color).

## Movimiento

El sitio público toma el lenguaje de los grandes gimnasios: fondo negro, fotos grandes, títulos enormes y mucho movimiento. Lo propio es el motivo: **la inclinación de 7° del «RED» del logo**, medida en sus trazos, es el corte de las fotos, los botones, el telón entre pantallas y los barridos.

- **Momento principal:** al bajar, la fachada real se abre en una ventana inclinada hasta llenar la pantalla, y se entra al gimnasio.
- **Al cargar:** un telón se corre, los títulos suben renglón por renglón y la foto del hero se abre.
- **Solas:** tres fotos reales rotan en el hero y una marquesina cruza la pantalla con datos del negocio.
- **Con el scroll:** la barra queda fija arriba (transparente sobre el hero, negra al bajar), las filas de fotos se cruzan y el logo del footer termina de crecer.
- **Del catálogo a un producto:** la imagen de la tarjeta viaja hasta la página del producto, y la ficha aparece al instante con los datos que ya tenía la tarjeta.
- **Con el mouse:** cada sección de la barra se barre con un bloque claro a 7° y su texto rueda. También hay barrido en los botones, la tapa de los envases que se levanta, la imagen del destacado que se inclina y un índice de categorías con vista previa que sigue al puntero.

Cada una tiene sus límites:

- **Se puede parar:** el botón «Pausar animaciones» detiene lo que se mueve solo y se recuerda entre visitas. Los bucles también se detienen fuera de pantalla y con la pestaña oculta.
- **Movimiento reducido:** con `prefers-reduced-motion` no hay telón ni bucles, y el escenario es una foto fija.
- **Pantallas táctiles:** ningún hover se queda pegado, y lo que mostraría ya está a la vista.
- **Navegadores sin animaciones por scroll:** la entrada al gimnasio se ve como una foto fija.
- **Panel de administración:** sin nada de esto. Se usa todos los días, y ahí la animación estorba.

No se agregó ninguna biblioteca: son transiciones y animaciones CSS, más unos pocos hooks propios.

## Mejoras y excepciones justificadas

La consigna admite mejoras justificadas sobre el boceto. Estas son las que se hicieron.

### Respecto del boceto y la Propuesta

| Cambio | Motivo |
|---|---|
| WhatsApp pasa a mensaje directo de Instagram | Decisión del negocio: ya no usa WhatsApp. |
| «Comprar» copia la consulta y abre el chat | Los enlaces de mensaje directo de Instagram no permiten dejar el texto escrito. Un aviso indica que hay que pegarla. |
| 3 íconos de redes pasan a 2 cuentas con su nombre visible | Son las cuentas reales: @redsuplementos_ y @redgym_ba. |
| Texto negro sobre el naranja, no blanco | Blanco sobre #d47e30 da 3,1:1 y no cumple AA; negro da 6,8:1. |
| Sitio público en negro, con productos y catálogo en gris | Los sitios de los grandes gimnasios son negros, y la Propuesta llama «Gris Oscuro / Negro» a su color de fondo (aunque el código que da, #e8e8e8, es un gris claro). El negro hace de campo y el gris queda donde se elige y se compra. |
| Hero a toda la pantalla, con el título cruzando sobre la foto | Mantiene el texto a la izquierda y la foto a la derecha del boceto, pero con la presencia de los sitios de gimnasios. La división es un corte inclinado, y no una columna. |
| Marquesina y galería de fotos | No están en el boceto. Se agregan entre sus bloques, sin cambiar el orden, porque son parte del lenguaje de los sitios de referencia. |
| Sobre nosotros en dos tiempos | Primero la entrada al gimnasio a pantalla completa; después, foto a la izquierda y texto a la derecha, como en el boceto. |
| Foto real del stock en la grilla de productos | Los 3 productos de la grilla se mantienen; se suma una foto real de los suplementos. |
| Título de «Productos estrella» a la izquierda, e índice de categorías al final | El boceto lo centra. A la izquierda continúa el eje de la página, y el índice lleva directo al catálogo filtrado. |
| Footer con foto de fondo y logo grande abajo | El boceto pone el logo arriba a la izquierda, los datos al centro y las redes a la derecha. Están los mismos contenidos; los enlaces y el contacto van arriba, y el logo gana tamaño como cierre de la página. |
| Catálogo, página de producto y panel | No están en el wireframe, pero sí en el análisis del sistema (F-03 y F-02). La página de producto suma la explicación de cómo se compra por Instagram. |

### Respecto de las reglas de diseño aplicadas

| Excepción | Motivo |
|---|---|
| El verificador de diseño marca el naranja como «terracota» (se corre con `--allow palette-terracotta`) | Es el color de marca de la Propuesta, y el fondo es gris neutro, no crema. |
| Sin video en la página | No hay ningún video real del local, y uno de stock lo representaría mal. |
| Filas de tarjetas de producto | La grilla la exige el boceto y muestra contenido real. |
| Dirección «one motif» con otro hero y fotos propias | El hero de carpetas que proponía no permite texto a la izquierda y foto a la derecha. Hay fotos reales, así que no se usan las de banco. Las fotos de producto quedan cuadradas, para que se vean bien. |

### Técnicas

- Animaciones sin bibliotecas: CSS y hooks propios, para no sumar peso ni dependencias.
- La transición de la tarjeta a la página de producto usa View Transitions. Sin soporte o con movimiento reducido es un enlace común.
- La página de producto recibe los datos de la tarjeta al navegar, así aparece sin esperar a la API, y después los actualiza. Abierta directo, los pide a `GET /api/productos/:id`.
- `react-router` v8 en modo declarativo, con `useTransitions={false}`. Los filtros viven en la URL y sus campos no pueden esperar a una actualización asíncrona.
- Sonner en lugar de avisos propios: es accesible y está probado. Si hiciera falta reemplazarlo, se cambia un solo archivo (`utils/notify.js`) y el `Toaster` de `App.jsx`.

## Imágenes

| Material | Origen |
|---|---|
| Fotos del gimnasio y del stock | Instagram de RED GYM, aportadas por el negocio (`docs/marca/fotos/`). Se recortaron y comprimieron a WebP. Solo se usan tomas del gimnasio real, sin las placas con texto ni las que parecen de banco de imágenes. |
| Fotos de 3 productos | Recortes de la foto real del stock. Se referencian por el campo `imagen` de la API. |
| Logo | Vectorizado desde `docs/marca/logo-original.jpg` con `sharp` y `potrace`, en variantes positiva, negativa, compacta y sticker (en `src/assets/brand/`). El sitio usa las negativas. El JPG original no se sirve en la web. |
| Productos sin foto | Ilustración geométrica del envase, por categoría. |
| Glifo de Instagram | Simple Icons (CC0). |

## Pendiente antes de publicar

- **Datos de demostración:** los precios y el stock de `docs/cargar-demo.mjs` son ficticios.
- **Fotos de producto:** 7 de los 10 productos de demo usan la ilustración, y las 3 fotos reales salen de un recorte, así que se ven algo blandas en el destacado.
- **Autenticación del panel:** depende de que el backend implemente RN-10.
- **Elegir los productos estrella:** la portada muestra 4 productos, elegidos por stock y categoría. Un producto nuevo aparece enseguida en el panel y en el catálogo, pero en la portada solo si entra en esa selección. La API todavía no tiene un campo para destacarlo a mano.

## Más documentación

- `docs/verificacion.md`: pruebas y resultados.
- `docs/capturas/boceto-vs-sitio.jpg`: los 5 bloques al lado del boceto. En la misma carpeta están las demás capturas.
- `docs/entrega-2-backend.md`: API, campos y códigos de error.
- `docs/entrega-1-dominio/`: las clases de dominio de la Entrega 1, que estaban en `Backend/` antes de esta entrega.
- `docs/arquitectura.md`: arquitectura del backend.
- `frontend/README.md`: comandos y variables del frontend.
- `frontend/DESIGN.md` y `frontend/PRODUCT.md`: sistema visual y contexto de producto.
