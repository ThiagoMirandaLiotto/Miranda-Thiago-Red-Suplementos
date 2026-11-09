---
name: RED Suplementos
description: La tienda de suplementos adentro de RED GYM, en Saavedra.
colors:
  naranja-energia: "#d47e30"
  naranja-energia-hover: "#c46f22"
  gris-logo: "#e8e8e8"
  papel: "#f5f5f5"
  hundido: "#dcdcdc"
  tinta: "#000000"
  tinta-suave: "#474747"
  campo: "#0b0b0b"
  campo-elevado: "#1a1a1a"
  tinta-palida-suave: "#a8a8a8"
  exito: "#1d6b3a"
  peligro: "#b3261e"
  aviso: "#8a4b00"
  blanco: "#ffffff"
  peligro-tinte: "#f3dcda"
  deshabilitado: "#d4d4d4"
  tinta-deshabilitada: "#4f4f4f"
  papel-hover: "#efefef"
  hundido-hover: "#cfcfcf"
  campo-hover: "#262626"
  borde-hover: "#b8b8b8"
  borde-campo: "#2e2e2e"
  barra-desplazamiento: "#8a8a8a"
  envase: "#161616"
typography:
  display:
    fontFamily: "Montserrat Variable, Montserrat, system-ui, sans-serif"
    fontSize: "min(7.6vw, 9.5rem)"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Montserrat Variable, Montserrat, system-ui, sans-serif"
    fontSize: "clamp(1.625rem, 1.2rem + 1.2vw, 2.25rem)"
    fontWeight: 800
    lineHeight: 1.1
  lead:
    fontFamily: "Open Sans Variable, Open Sans, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.05rem + 0.6vw, 1.5rem)"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Open Sans Variable, Open Sans, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Open Sans Variable, Open Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  none: "0"
spacing:
  gutter: "clamp(16px, 2.6vw, 32px)"
  section: "clamp(96px, 11vw, 176px)"
  control: "48px"
  control-lg: "56px"
components:
  button-primary:
    backgroundColor: "{colors.naranja-energia}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.naranja-energia-hover}"
  button-secondary:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.gris-logo}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "48px"
  button-tonal:
    backgroundColor: "{colors.hundido}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "48px"
  button-danger:
    backgroundColor: "{colors.peligro}"
    textColor: "#ffffff"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "48px"
  input:
    backgroundColor: "{colors.gris-logo}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.none}"
    padding: "0 14px"
    height: "48px"
  nav-publica:
    backgroundColor: "{colors.campo}"
    textColor: "{colors.gris-logo}"
    height: "72px"
  barra-panel:
    backgroundColor: "{colors.campo}"
    textColor: "{colors.gris-logo}"
    height: "64px"
---

# Design System: RED Suplementos

## Overview

**Creative North Star: "Siete grados"**

Los gimnasios más importantes del mundo tienen sitios negros, con fotos enormes, títulos gigantes en mayúsculas y mucho movimiento. RED Suplementos habla ese idioma, pero con algo propio: **la inclinación de 7° del «RED» del logo, medida en sus trazos, es el corte de todo.** Fotos, botones, el telón entre pantallas y el barrido de cada hover van a ese ángulo.

- **Las fotos son siempre del gimnasio real:** paredes naranjas, socios entrenando, la fachada de Rogelio Yrurtia 6028 y los suplementos sobre los discos.
- **El negro es el campo del sitio público.** El gris del logo entra como capítulo de contraste donde se elige y se compra: los productos y el catálogo.
- **El naranja significa «actuá»,** y las paredes del gimnasio en las fotos lo acompañan.

El panel de administración es otro mundo a propósito: gris claro, botones rectos y sin animaciones de entrada, porque se usa todos los días.

**Key Characteristics:**

- **Motivo único:** el corte a 7°, en cuatro escalas (la foto del hero, las fotos, los botones y el separador de la marquesina).
- **Títulos:** Montserrat 900 itálica en mayúsculas, a más de seis veces el tamaño del texto.
- **Acento único:** Naranja Energía, solo en llamados a la acción y siempre con texto negro.
- **Movimiento con trabajo:** cada animación confirma algo, muestra de dónde viene algo o es parte del momento principal, y todo tiene su versión con movimiento reducido.

## Colors

### Primary

- **Naranja Energía** (#d47e30): botones de acción (Escribinos, Comprar, Crear producto, Guardar cambios). Lleva siempre texto negro (6,8:1); el blanco daría 3,1:1. Al pasar el mouse lo barre Naranja Energía oscuro (#c46f22).

### Neutral

- **Campo** (#0b0b0b) y **campo elevado** (#1a1a1a): el fondo del sitio público, la barra, los títulos de pantalla, la barra del panel y los avisos.
- **Gris del logo** (#e8e8e8): el capítulo de productos y catálogo, el fondo del panel y la marquesina. También es la tinta pálida sobre el campo.
- **Papel** (#f5f5f5): escalón claro para superficies (filtros, grupos del formulario, filas de la tabla, destacado, diálogo).
- **Hundido** (#dcdcdc): escalón oscuro (skeletons, fondo de las placas de producto, encabezado de la tabla, botón tonal).
- **Tinta** (#000000): el texto sobre los fondos claros.
- **Tinta suave** (#474747): texto secundario (7,6:1 sobre el gris) y las filas no señaladas del índice de categorías.
- **Tinta pálida suave** (#a8a8a8): texto secundario sobre campo plano. Sobre fotos no alcanza: ahí todo va en tinta pálida (#e8e8e8) y la jerarquía la da el tamaño.
- **Escalones de interacción:** papel, hundido y campo tienen su tono de hover (#efefef, #cfcfcf y #262626). Los botones deshabilitados usan #d4d4d4 con texto #4f4f4f, y el botón de peligro lleva texto blanco.
- **Envase** (#161616): el cuerpo de las placas de producto.

### Estados

Siempre con ícono y texto, nunca solo color:

- **Éxito** (#1d6b3a)
- **Peligro** (#b3261e): bajas y errores
- **Aviso** (#8a4b00): stock bajo

### Named Rules

**The Naranja Único Rule.** El naranja aparece solo en botones de acción. Nunca como texto, nunca en el logo ni en estados, nunca decorativo.

**The Capítulo Rule.** El negro y el gris no se mezclan de a poco: cada sección es un campo entero, y el paso de uno al otro es un borde a 7°. El sitio público empieza y termina en negro.

**The Velo Neutro Rule.** Texto sobre foto solo con un velo negro debajo, y medido: cada título, contra el píxel más desfavorable de cada foto.

## Typography

**Display Font:** Montserrat Variable (con Montserrat y system-ui de respaldo)
**Body Font:** Open Sans Variable (con Open Sans y system-ui de respaldo)

**Character:** Montserrat pesada e itálica para gritar como el «RED» del logo; Open Sans neutra y legible para precios, descripciones y formularios. Las dos fuentes se sirven desde el proyecto con fontsource.

### Hierarchy

- **Display** (900 itálica en mayúsculas, 10,2vw en teléfono y min(7,6vw, 9,5rem) desde 1024 px, interlineado 0.92, tracking -0.03em): los títulos de pantalla y de sección del sitio público, la marquesina, el índice de categorías y la cifra del descuento.
- **Title** (800, clamp(1.625rem, 1.2rem + 1.2vw, 2.25rem), 1.1): nombre del producto destacado, precios grandes y títulos del panel.
- **Lead** (600, clamp(1.25rem, 1.05rem + 0.6vw, 1.5rem), 1.3): frase del hero, bajadas, subtítulos y nombres de tarjeta.
- **Body** (400, 17px, 1.55): texto corrido, botones, links y labels. Ancho máximo de 46ch en los bloques de lectura.
- **Label** (600, 14px, 1.4): metadatos, badges de stock, contadores, ayudas de campo y línea legal.

### Named Rules

**The Inclinación Rule.** Solo los títulos grandes van en itálica 900. El texto de lectura nunca va en itálica.

**The Cinco Tamaños Rule.** El sitio usa cinco tamaños (14, 17, 24, 36 y 109 px a 1440 px de ancho). Un tamaño nuevo reemplaza a otro; no se suma.

**The Dos Renglones Rule.** Ningún título pasa de dos renglones en ningún ancho. En los títulos largos, los cortes de renglón se deciden a mano.

## Layout

- **Márgenes:** un par de márgenes laterales fluidos (16 a 32 px) en todo el sitio. Entre secciones hay mucho más aire que dentro de ellas.
- **Composiciones de la portada, en el orden del boceto:**
  - **Barra:** fija y transparente sobre el hero; sólida al bajar.
  - **Hero:** a toda la pantalla. La foto entra desde la derecha en un corte a 7°, el texto va a la izquierda sobre el negro y el título cruza sobre el borde.
  - **Marquesina:** una banda gris de borde a borde con datos reales del negocio.
  - **Adentro de RED GYM:** el título sobre el negro; después, el escenario (la ventana que se abre) y debajo foto a la izquierda y texto a la derecha.
  - **Galería:** dos filas de fotos encastradas a 7° que se cruzan con el scroll.
  - **Productos estrella:** entra con un borde a 7°. Destacado dividido, grilla con la foto real del stock y tres tarjetas, y el índice de categorías como pared de texto.
  - **Footer:** foto a todo el ancho con velo plano, enlaces y contacto arriba, y el logo completo en negativo abajo a la izquierda.
- **Página de producto** (el bloque «placa cuadrada y texto justo» de la dirección):
  - **Primera pantalla:** el producto ocupa la izquierda a toda la altura, sobre un panel gris con el borde a 7°. A la derecha van el nombre, el precio, «Comprar» y los datos.
  - **Debajo:** una marquesina con los datos del producto, «Cómo se compra» (tres verbos enormes y la foto de la fachada, donde se retira) y «Seguí mirando», con la foto del stock y tres productos más.
  - **En el teléfono:** primero el nombre, después el producto y debajo la ficha.
- **Panel de administración:** contenido centrado de hasta 1240 px, con tabla desde 860 px y tarjetas apiladas por debajo.
- **Puntos de quiebre:** 560, 720, 860, 900, 960, 1024, 1100 y 1280 px. Cada composición tiene su versión de teléfono propia.

## Motion

Curvas fuertes de salida (`cubic-bezier(0.23, 1, 0.32, 1)`) y, para lo que se mueve estando a la vista, `cubic-bezier(0.77, 0, 0.175, 1)`. El CSS hace todo lo que puede y el resto es código propio, sin bibliotecas. Las animaciones usan `transform`, `opacity` y `clip-path`.

### El momento principal

**La entrada al gimnasio.** Al bajar, la fachada real se abre en una ventana a 7° hasta llenar la pantalla, y el interior la barre: se entra al local. Está ligada al scroll y usa solo `transform` para abrirse. Sin soporte de animaciones por scroll, o con movimiento reducido, se ve como una foto fija y no retiene el scroll.

### El resto del sistema

| Elemento | Qué hace | Tiempo |
|---|---|---|
| Telón entre pantallas | Un campo negro a 7° se corre y descubre la pantalla. No bloquea clics | 560 ms |
| Títulos | Cada renglón sube desde atrás de su línea de base | 900 ms, con 110 ms entre renglones |
| Fotos del hero | Tres tomas reales; cada una entra barriendo a 7° y se asienta despacio | Cambia cada 6 s; barrido de 1 s |
| Marquesina | Avanza constante; con el scroll acelera y se inclina hasta 7° | 48 s por vuelta |
| Barra | Queda fija arriba: transparente sobre el hero, negra al bajar | 220 ms |
| Secciones de la barra | Un bloque claro a 7° barre el enlace y el texto pasa a negro mientras rueda. El foco de teclado recibe lo mismo | 260 ms entrando, 150 ms saliendo |
| Tarjeta → página de producto | La imagen viaja de la tarjeta a la página (View Transitions), sin telón | 520 ms |
| Barra de compra | Baja desde abajo de la barra principal cuando los botones de la ficha quedaron arriba | 280 ms |
| Galería y retratos | Se desplazan con el scroll; la foto señalada se acerca y las demás se atenúan | Hover de 400 ms |
| Botones | Al pasar el mouse los barre el tono de hover; el ícono se inclina; al presionar, `scale(0.97)` | 260 ms entrando, 150 ms saliendo, 140 ms al presionar |
| Botón principal del hero | Se acerca al puntero, 12 px como máximo | Interpolado cuadro a cuadro |
| Enlaces de barra y footer | El texto rueda y lo reemplaza su copia | 260 ms |
| Tarjetas | La tapa del envase se levanta 7°, el envase sube y un barrido cambia el tono de la placa; las fotos se acercan | 280 a 400 ms |
| Destacado | La imagen se inclina hacia el puntero, 7° como máximo | Interpolado cuadro a cuadro |
| Índice de categorías | El negro barre la fila señalada y aparece su producto junto al puntero; las demás filas pasan a tinta suave | 280 ms |
| Cifra del descuento | Cuenta hasta 10 una sola vez | 900 ms |
| Catálogo | Las tarjetas suben 20 px, escalonadas cada 50 ms hasta la octava | 400 ms |

### Named Rules

**The Hover Honesto Rule.** Todo hover vive detrás de `(hover: hover) and (pointer: fine)`. En pantallas táctiles, lo que el hover mostraría ya está a la vista.

**The Se Puede Parar Rule.** Lo que se mueve solo tiene un botón «Pausar animaciones» (WCAG 2.2.2), que se recuerda entre visitas. Los bucles se detienen fuera de pantalla y con la pestaña oculta.

**The Movimiento Reducido Rule.** Con `prefers-reduced-motion`, nada se traslada ni corre en bucle: no hay telón, los títulos y las fotos están desde el principio y el escenario es una foto fija.

**The Panel Quieto Rule.** El panel de administración no recibe nada de esto: solo la respuesta de los controles, el diálogo, los avisos y los skeletons.

## Elevation & Depth

El sistema es plano. La profundidad sale de los cambios de campo, de los escalones de tono y de las fotos. Solo lo que flota de verdad tiene sombra: el diálogo de confirmación y los avisos laterales.

### Shadow Vocabulary

- **Flotante** (`box-shadow: 0 18px 48px rgb(0 0 0 / 0.28), 0 2px 8px rgb(0 0 0 / 0.18)`): diálogo y avisos.

### Named Rules

**The Plano en Reposo Rule.** Ninguna tarjeta, botón ni sección lleva sombra en reposo. Si algo necesita separarse, cambia de tono.

## Shapes

- **El corte a 7°:** sale del logo. Su tangente (0,1228) da el corrimiento horizontal de cualquier corte: 12,28 % del alto. En una foto 4:5 equivale a 15,35 % del ancho.
- **Esquinas:** rectas en todo.
- **El logo:** lleva su propio lenguaje. La barra usa el compacto en negativo y el footer, el completo en negativo.
- **Placas de producto:** dibujos geométricos de envase (pote, frasco o barra) en negro con etiqueta blanca. Nunca imitan una foto.

## Components

### Buttons

- **Sitio público:** el botón entero va inclinado 7° y su contenido se endereza con la inclinación contraria. El foco sigue la misma forma.
- **Panel:** rectos, sin barrido.
- **Alto:** 48 px (56 px en la variante grande y 72 px en las acciones del destacado).
- **Primary:** Naranja Energía con texto negro, Montserrat 700 17px. Solo para la acción principal de cada pantalla y para «Comprar».
- **Foco:** anillo de 3 px con separación de 3 px, negro sobre claro y gris del logo sobre campo.
- **Secondary / Tonal / Ghost / Danger:**
  - **Secondary:** negro, para «Reintentar» y «Consultar disponibilidad»; gris del logo sobre campo.
  - **Tonal:** gris hundido, para Editar, Ver catálogo y Cancelar en el diálogo.
  - **Ghost:** subrayado y sin relleno ni inclinación, para Cancelar y Limpiar filtros.
  - **Danger:** rojo con texto blanco (6,5:1), para confirmar una baja.
  - **Peligro sin relleno:** para «Dar de baja» dentro de las filas.

### Cards / Containers

- **Background:** la tarjeta no tiene contenedor. Es una placa cuadrada y su texto apoyado directo sobre el gris del logo. Los grupos de formulario y los filtros usan papel.
- **Shadow Strategy:** ninguna (ver The Plano en Reposo Rule).
- **Internal Padding:** 16 a 24 px en superficies de papel.

### Inputs / Fields

- **Style:** fondo gris del logo dentro de grupos de papel, borde de 2 px transparente y alto de 48 px. El label va siempre visible arriba, en Montserrat 700.
- **Focus:** borde negro y anillo de 3 px.
- **Error / Disabled:**
  - **Error:** borde rojo, mensaje rojo con ícono enlazado por `aria-describedby` y `aria-invalid`.
  - **Disabled:** fondo hundido.
  - **Obligatorio:** se indica con el texto «(obligatorio)».

### Navigation

- **Sitio público:** barra negra siempre fija, con el logo compacto a la izquierda, cuatro links (Montserrat 600) y «Escribinos» en naranja. Es transparente con un velo sobre el hero. El link actual lleva una barra a 7°. Al señalar un link, un bloque claro a 7° lo barre, el texto pasa a negro y rueda.
- **Teléfono:** la palabra «Menú» abre una pantalla completa con los links en tipografía de título, que entran uno tras otro. Se cierra con Esc.
- **Panel:** barra negra con el logo en negativo, «Productos» y «Ver tienda».

### Barra de compra

En la página de producto, al quedar atrás los botones de la ficha, baja desde abajo de la barra principal con el nombre, el precio y «Comprar». En el teléfono muestra solo el precio y el botón. Se va al llegar al footer y, oculta, queda fuera del foco (`inert`).

### Diálogo de confirmación

Usa el `<dialog>` nativo con `showModal()` y entra centrado (opacidad y escala de 0.97 a 1) en 220 ms.

- **Salida:** en 150 ms.
- **Foco inicial:** en «Cancelar».
- **Cancelar:** Esc o un clic en el fondo.
- **Mientras se procesa:** no se cierra.

### Avisos

Avisos laterales de Sonner abajo a la derecha, en el campo negro, con esquinas rectas, ícono de estado coloreado y título de 14 px. Los errores duran 8 s y tienen botón de cierre.

## Do's and Don'ts

### Do:

- **Do** poner texto negro sobre el Naranja Energía (#d47e30).
- **Do** usar fotos reales de RED GYM o del stock de la tienda. Si un producto no tiene foto, va su placa dibujada.
- **Do** cortar a 7° (`--lean`, `--lean-tan`): si una forma nueva necesita inclinación, usa esa.
- **Do** acompañar cada estado (stock, éxito, error) de texto e ícono.
- **Do** restringir el hover a `(hover: hover) and (pointer: fine)` y dar una versión a `prefers-reduced-motion`.
- **Do** medir el texto que va sobre una foto: axe no lo evalúa.

### Don't:

- **Don't** usar texto blanco sobre el naranja, ni el naranja como texto.
- **Don't** teñir el logo de naranja ni deformarlo. Las variantes son positiva, negativa, compacta y sticker.
- **Don't** usar fondos crema, degradés decorativos, sombras en reposo ni esquinas redondeadas.
- **Don't** usar mayúsculas espaciadas como etiqueta (eyebrow) arriba de un título.
- **Don't** poner un título fijo sobre una foto que se mueve, ni nada encima de un título.
- **Don't** mostrar WhatsApp: el canal de la tienda es el mensaje directo de Instagram.
- **Don't** agregar animaciones de entrada ni formas inclinadas en el panel de administración.
