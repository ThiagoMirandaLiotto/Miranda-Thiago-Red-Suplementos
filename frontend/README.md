# RED SUPLEMENTOS — Frontend

Interfaz en React 19 + Vite. Las instrucciones para correr todo el proyecto y las decisiones de la entrega están en el [README de la raíz](../README.md).

## Comandos

Requisito: Node.js 22.22 o superior.

| Comando | Qué hace |
|---|---|
| `npm ci` | Instala las dependencias |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compila para producción en `dist/` |
| `npm run preview` | Sirve la compilación para probarla |
| `npm run lint` | Revisa el código con ESLint |

El frontend corre por su cuenta: con la API apagada, muestra un error con «Reintentar» en lugar de romperse.

## Variables de entorno

Son opcionales. Se definen en `.env.local` (ver `.env.example`).

| Variable | Por defecto | Para qué sirve |
|---|---|---|
| `VITE_API_URL` | `/api` | URL base de la API. El proxy de `vite.config.js` envía `/api` a `http://127.0.0.1:3000`. |
| `VITE_DEMORA_API_MS` | `0` | Demora artificial antes de cada petición, para mostrar los estados de carga. |

## Convenciones

- **Estilo:** igual que el backend (4 espacios, comillas dobles, punto y coma, módulos ES).
- **Nombres:** el dominio va en español, como en la API (`producto`, `getProductos`, `ProductoCard`). Las piezas genéricas de interfaz, en inglés (`Button`, `ConfirmDialog`).
- **Estilos:** tokens y estilos generales en `src/styles/`; cada componente tiene su CSS Module al lado. Los colores, los tamaños de texto y las duraciones de la interfaz salen de los tokens. Las secuencias puntuales, como la entrada del hero, definen sus tiempos en su propio CSS.
- **Datos:** los productos y las categorías llegan siempre de la API. Los datos del negocio (dirección, horario, cuentas de Instagram, navegación) están en un solo lugar: `src/utils/constants.js`.

## Movimiento

Las animaciones del sitio público están descriptas en [`DESIGN.md`](DESIGN.md), en la sección Motion. Tres reglas al sumar una nueva:

- **Hover:** siempre detrás de `(hover: hover) and (pointer: fine)`.
- **Movimiento reducido:** necesita su versión con `prefers-reduced-motion`.
- **Inclinación:** usa `--lean` y `--lean-tan`, los 7° del logo.

Para probar sin movimiento, activá «Reducir movimiento» en el sistema operativo, o usá el botón «Pausar animaciones» del hero.

## Cómo agregar la foto de un producto

El campo `imagen` de la API guarda una URL o una ruta.

1. Copiar la foto a `public/img/productos/`.
2. En el panel, escribir la ruta en el campo Imagen, por ejemplo `/img/productos/whey.webp`.

Si un producto no tiene imagen, o si la imagen no carga, se muestra la ilustración de su categoría.

## Diseño

- [`DESIGN.md`](DESIGN.md): sistema visual (colores, tipografía, componentes y reglas).
- [`PRODUCT.md`](PRODUCT.md): contexto de producto en el que se apoyan las decisiones de diseño.
