# Verificación de la entrega

## Entrega 3: frontend

Verificado el 7 de noviembre de 2026 sobre el código final, con Node.js 24.21.0 y Chrome 155 sin ventana. No se ejecutó una matriz de versiones ni de navegadores.

### Resultados

| Prueba | Resultado |
|---|---|
| `npm test` en `backend` | 24 de 24 |
| `npm run lint` en `frontend` | Sin errores y sin reglas desactivadas |
| `npm run build` y `npm run preview` | Compila. El proxy y las rutas abiertas directamente responden (incluida `/catalogo/:id`), sin imágenes rotas |
| Recorrido completo en navegador | 79 de 79 |
| Página de producto, enlaces desde las tarjetas y barra fija con hover | 45 de 45 |
| Animaciones y hovers | 59 de 59 |
| Casos límite: textos largos, anchos de 320 a 1440 px, anclas, saltos de layout, movimiento reducido | 36 de 36 |
| Recorrido solo con teclado y casos adicionales | 20 de 20 |
| axe, WCAG A y AA | 0 violaciones en 9 vistas: inicio, catálogo, panel, formulario con errores, diálogo de baja, panel en teléfono, página de producto, producto en teléfono y producto inexistente |
| Contraste del texto sobre fotos, que axe no evalúa | 52 mediciones correctas: hero con sus tres fotos, barra transparente y footer a 390, 768, 1024 y 1440 px, contra el píxel más desfavorable detrás de cada línea |
| Medidor de diseño (Taste) en inicio, catálogo y dos páginas de producto | 0 FAIL y 1 WARN en cada una: no hay video, porque no existe uno real del local |
| Detector de Impeccable | 0 hallazgos |
| `backend/` comparado con la Entrega 2 | Sin diferencias, sin contar `node_modules` |

Para reproducir las pruebas del proyecto:

```bash
cd backend && npm ci && npm test
cd frontend && npm ci && npm run lint && npm run build
```

Las pruebas en navegador se hicieron con scripts de Playwright que no forman parte de esta entrega. Por eso se detallan a continuación, junto con las capturas.

### Recorrido funcional

| # | Punto | Resultado |
|---|---|---|
| 1 | Con la API apagada, la app carga y muestra el error, un aviso y «Reintentar». Al encender la API, «Reintentar» funciona. | Correcto |
| 2 | Sin productos, el inicio, el catálogo y el panel muestran su estado vacío. | Correcto |
| 3 | Un alta inválida marca los campos, lleva el foco al primer error y no envía ninguna petición. | Correcto |
| 4 | Un alta válida muestra el aviso y el producto aparece en el panel, el catálogo y el inicio. | **Correcto con una salvedad:** ver la nota de abajo |
| 5 | Un duplicado muestra el 409 en el campo y en un aviso. | Correcto |
| 6 | La edición aparece precargada, `27000,5` se guarda como `27000.5` y el PUT lleva exactamente los 9 campos. | Correcto |
| 7 | `/admin/productos/999/editar` y `/admin/productos/abc/editar` muestran «no encontrado». | Correcto |
| 8 | «Dar de baja» abre el diálogo, Esc y Cancelar no cambian nada, y al confirmar se ven la carga y el aviso. La fila desaparece y el inicio se actualiza. | Correcto |
| 9 | «Comprar» copia el mensaje, abre `ig.me/m/redsuplementos_` en otra pestaña y avisa. Si el portapapeles falla, el aviso muestra el texto. | Correcto, con Instagram simulado |
| 10 | Alta, edición, baja y compra se completan solo con teclado. Cada parada de foco es visible y tiene nombre. | Correcto |
| 11 | A 390, 768 y 1440 px no hay scroll horizontal ni texto cortado, y el logo se ve nítido sobre fondos oscuros. Con la demora activada se ven los estados de carga. | Correcto. El texto y el logo se revisaron mirando las capturas |

**Nota sobre el punto 4.** La portada muestra 4 productos, elegidos por stock y categoría. El producto nuevo aparece en ella si entra en esa selección, como se comprobó con la API vacía. Con los 10 productos de demo cargados, aparece enseguida en el panel y en el catálogo, pero no en la portada.

### Página de producto y barra

| Qué se comprobó | Resultado |
|---|---|
| Tocar una tarjeta del catálogo (el nombre o la imagen) abre la página de su producto | Correcto |
| La ficha aparece al instante con los datos de la tarjeta, la imagen viaja de la tarjeta a la página (View Transitions) y no hay telón encima | Correcto |
| La página arranca arriba y el foco queda en el nombre; la pestaña lleva el nombre del producto | Correcto |
| «Comprar» de la tarjeta sigue siendo su propio botón: abre Instagram y no la página | Correcto |
| Con Enter sobre una tarjeta se abre el producto; la imagen del destacado enlaza pero no suma una parada de teclado | Correcto |
| La ficha muestra la ruta Catálogo › categoría, el precio de la API, «Comprar», «Más de…» al catálogo filtrado y el estado del local según la hora | Correcto |
| «Seguí mirando» muestra 3 productos distintos, sin repetir el actual | Correcto |
| La barra de compra baja debajo de la barra principal al pasar los botones (también si se salta de golpe), copia la consulta de este producto y se va al llegar al footer | Correcto |
| Abierta directo, la página se arma desde `GET /api/productos/:id`; `/catalogo/999` y `/catalogo/abc` muestran «ya no está disponible» | Correcto |
| Con movimiento reducido, se abre el producto sin transición de imagen | Correcto |
| La barra principal queda fija arriba en cualquier scroll | Correcto |
| Al señalar cada sección de la barra, un bloque claro la barre, el texto pasa a negro y rueda; al irse el mouse, el barrido se va | Correcto |
| Con Tab, el foco recibe el mismo barrido | Correcto |
| A 320 y 390 px no hay scroll horizontal | Correcto |

### Animaciones y hovers

| Qué se comprobó | Resultado |
|---|---|
| El telón no bloquea clics y termina oculto | Correcto |
| Las fotos del hero rotan solas | Correcto |
| «Pausar animaciones» detiene la rotación y la marquesina, anuncia su estado, se recuerda al recargar y se puede reanudar | Correcto |
| La barra es transparente sobre el hero, sólida al bajar y queda fija arriba | Correcto |
| La ventana se abre con el scroll (escala de 0,57 a 1,28), cubre la pantalla, el interior la barre y la foto termina a tamaño real | Correcto |
| Las filas de la galería se mueven con el scroll; la foto señalada se acerca y las demás se atenúan | Correcto |
| Los botones van inclinados 7°, los barre el tono de hover y responden al presionar. Naranja con texto negro | Correcto |
| El botón principal se acerca al puntero, 12 px como máximo | Correcto |
| Los enlaces ruedan sin duplicar el texto para los lectores de pantalla | Correcto |
| La tapa del envase se levanta. La imagen del destacado se inclina, 7° como máximo | Correcto |
| La vista previa del índice sigue al puntero, también al bajar con el mouse quieto, y no intercepta clics | Correcto |
| Las filas no señaladas del índice se atenúan sin bajar de contraste AA | Correcto |
| Con pantalla táctil no hay hover: el índice muestra la imagen en cada fila, sin vista previa flotante | Correcto |
| El menú del teléfono ocupa toda la pantalla, bloquea el scroll de atrás y lo libera al cerrar | Correcto |
| Con movimiento reducido no queda nada en movimiento, no hay telón, títulos y fotos están desde el principio y el escenario no retiene el scroll | Correcto |
| El panel de administración no tiene telón y sus botones siguen rectos | Correcto |
| Tipear en la búsqueda del catálogo no pierde letras ni dispara el telón | Correcto |

### Fluidez y peso

Medido sobre el build de producción, recorriendo toda la portada en 12 segundos. La CPU se frenó por software en Chrome sin ventana, sin GPU real.

| Situación | Cuadros por segundo | Cuadros de más de 50 ms |
|---|---|---|
| Escritorio, 1440 px | 60 | 0 de 721 |
| Escritorio, CPU 4 veces más lenta | 60 | 0 de 721 |
| Teléfono, 390 px, CPU 4 veces más lenta | 60 | 0 de 720 |
| Teléfono, 390 px, CPU 6 veces más lenta | 60 | 0 de 718 |

El resultado se repitió en tres corridas. Una medición anterior, hecha mientras corrían otras pruebas en la misma máquina, dio 28 cuadros por segundo con la CPU 6 veces más lenta. La medición depende de la carga de la computadora y no reemplaza probar en un teléfono.

La portada descarga 1,01 MB en escritorio y 0,85 MB en teléfono, con todas sus fotos. El salto de layout acumulado es de 0,03 o menos. El JS pesa 117 KB comprimido, sin bibliotecas de animación.

### Búsquedas en el código

| Búsqueda en `frontend/src` | Resultado |
|---|---|
| `fetch(` | Solo en `services/apiClient.js` |
| `alert(`, `confirm(`, `prompt(` | Ninguno |
| `whatsapp`, `wa.me` | Ninguno |
| Productos escritos a mano | Ninguno |
| Importación del JPG original del logo | Ninguna |
| Colores escritos fuera de `styles/tokens.css` | Ninguno |
| Tamaños de letra escritos a mano | Ninguno |
| `eslint-disable` | Ninguno |
| Imágenes sin usar en `assets/img` | Ninguna |

`App.jsx` contiene solo las rutas y el sistema de avisos.

### Componentes reutilizables

| Carpeta | Componente | Pantallas |
|---|---|---|
| ui | `Button`, `Logo`, `Spinner` | Todas |
| ui | `Skeleton` | Inicio, Catálogo, Producto, Panel, Alta, Edición |
| ui | `ErrorState` | Inicio, Catálogo, Panel, Alta, Edición |
| ui | `EmptyState` | Inicio, Catálogo, Panel, Edición |
| ui | `TextField`, `SelectField`, `FieldShell` | Catálogo, Panel, Alta, Edición |
| ui | `Badge` | Inicio, Catálogo, Producto, Panel |
| ui | `InstagramIcon`, `TextoRoll` | Inicio, Catálogo, Producto, 404 |
| ui | `Revelar`, `BotonMovimiento` | Inicio, Producto |
| ui | `TextAreaField` | Alta, Edición |
| ui | `ConfirmDialog` | Panel |
| layout | `RouteFocus`, `ErrorBoundary`, `SkipLink` | Todas |
| layout | `PublicLayout`, `Navbar`, `Footer` | Inicio, Catálogo, Producto, 404 |
| layout | `AdminLayout`, `EncabezadoPanel` | Panel, Alta, Edición |
| landing | `Marquesina` | Inicio, Producto |
| landing | `Hero`, `SobreNosotros`, `GaleriaGimnasio`, `ProductosEstrella` | Inicio |
| productos | `ProductoImagen`, `PlacaProducto` | Inicio, Catálogo, Producto, Panel, Alta, Edición |
| productos | `StockBadge` | Inicio, Catálogo, Producto, Panel |
| productos | `ProductoCard`, `BotonComprar`, `EnlaceProducto` | Inicio, Catálogo, Producto |
| productos | `ProductoDestacado`, `IndiceCategorias` | Inicio |
| productos | `ProductoFiltros` | Catálogo, Panel |
| productos | `ProductoForm`, `ProductoFormSkeleton` | Alta, Edición |
| productos | `ProductoTabla` | Panel |

### Capturas

Están en `docs/capturas/`, con los datos de demostración. Las páginas públicas completas se armaron pegando capturas tomadas al bajar, porque la captura de página completa del navegador altera las animaciones por scroll. Por eso, en esas imágenes, la entrada al gimnasio se ve en distintos momentos.

| Tema | Archivos |
|---|---|
| Boceto y sitio, bloque por bloque | `boceto-vs-sitio.jpg` |
| Pantallas a 1440 px | `inicio-1440.jpg`, `catalogo-1440.jpg`, `producto-1440.jpg`, `panel-1440.jpg`, `formulario-1440.jpg`, `404-1440.jpg` |
| Tamaños menores | `inicio-`, `catalogo-` y `panel-` en `390.jpg` y `768.jpg`, y `producto-390.jpg` |
| Momentos de animación | `momento-ventana-1.jpg` a `momento-ventana-4.jpg`, `momento-transicion.jpg`, `momento-barra-hover.jpg`, `momento-barra-compra.jpg`, `momento-indice-hover.jpg`, `momento-tarjeta-hover.jpg` |
| Estados de carga con `VITE_DEMORA_API_MS=800` | `carga-inicio-productos.jpg`, `carga-catalogo.jpg`, `carga-panel.jpg`, `carga-formulario.jpg` |
| Otros estados | `panel-api-caida.png`, `panel-vacio.png`, `panel-alta-errores.png`, `panel-dialogo-baja.png`, `landing-aviso-comprar.png` |

### Lo que no se verificó

- **Dispositivos reales:** los anchos de teléfono y tableta y la velocidad de un equipo modesto se simularon en Chrome. No se probó en un teléfono real, donde más puede notarse el peso de las animaciones.
- **Otros navegadores:** no se probó en Firefox ni Safari. Sin animaciones por scroll, la entrada al gimnasio se ve como una foto fija y las filas de la galería quedan quietas. Sin View Transitions, la página de producto se abre con el telón, como un enlace común. Ese comportamiento se dedujo del código y se comprobó con movimiento reducido, no en esos navegadores.
- **Lector de pantalla:** no se probó con NVDA, VoiceOver ni otro lector. La accesibilidad se comprobó con axe y con el recorrido de teclado.
- **Chat de Instagram:** en las pruebas la pestaña se simuló. Aparte, se comprobó que `ig.me/m/redsuplementos_` redirige a Instagram y que los perfiles responden, pero no se abrió el chat con una sesión iniciada ni se envió un mensaje.
- **Páginas de error en el medidor de diseño:** el 404 y el producto inexistente dan FAIL por pocas fotos (el 404 también por poco movimiento). Son una sola pantalla sin contenido y el medidor está pensado para páginas de contenido, así que se dejaron así.

## Entrega 2: API

Resultado: **24 pruebas aprobadas, 0 fallidas** con `npm test`.

Entorno de ejecución: Node.js 24.19.0 y Express 5.2.1. El proyecto declara Node.js 22 o superior; no se ejecutó una matriz de versiones.

Se probaron las cinco operaciones CRUD mediante HTTP local, persistencia temporal, baja lógica, aislamiento entre aplicaciones, duplicados y respuestas de error. También se comprobó el inicio real de `src/server.js` y una consulta HTTP al catálogo.

Para reproducir las pruebas desde la carpeta backend:

```bash
npm ci
npm test
```
