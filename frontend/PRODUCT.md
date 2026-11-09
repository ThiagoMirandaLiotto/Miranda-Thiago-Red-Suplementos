# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Visitantes y clientes:** jóvenes y adultos que entrenan (musculación, fitness, deportes). Muchos son socios de RED GYM y ven el sitio desde el celular, antes o después de entrenar.
- **Administrador:** el dueño del local. Carga, edita y da de baja productos desde el panel, varias veces por semana, en desktop o celular.

## Product Purpose

Mostrar el catálogo de RED Suplementos de forma clara, para comparar y consultar antes de comprar, y agilizar los pedidos. Las consultas y los pedidos se hacen por mensaje directo de Instagram a @redsuplementos_, y los productos se retiran en el local.

El éxito se mide en dos cosas: que el visitante encuentre el producto y le escriba a la tienda en pocos pasos, y que el dueño mantenga el catálogo al día sin errores.

## Positioning

La tienda está **adentro de RED GYM** (Rogelio Yrurtia 6028, Saavedra, CABA): comprás donde entrenás y retirás en el mismo lugar, todos los días de 7 a 22 h. Los socios de RED GYM con membresía activa tienen 10 % de descuento.

## Operating Context

- Instagram es el canal real del negocio: @redsuplementos_ (tienda) y @redgym_ba (gimnasio). **No se usa WhatsApp.**
- Los links de mensaje directo (`ig.me/m/…`) no permiten dejar el texto escrito. Por eso la consulta se copia al portapapeles antes de abrir el chat.
- Entrega académica (Entrega 3, Frontend). El backend es la API de la Entrega 2 (Express): CRUD de productos con baja lógica y categorías de solo lectura.

## Capabilities and Constraints

- **Categorías fijas, que vienen de la API:** Proteínas, Creatina, Pre-entreno, Aminoácidos y Barras proteicas.
- **Lo que la API no tiene:** carrito, pedidos, usuarios, autenticación (RN-10 pendiente: el panel queda abierto), filtros del lado del servidor, PATCH y subida de imágenes. El campo `imagen` es una URL o una ruta de texto.
- **Persistencia en memoria:** al reiniciar el backend se pierden los productos. Un catálogo vacío es un estado normal.
- **La API exige:** solo los 9 campos editables; números como `number`; precio > 0 con 2 decimales como máximo; stock entero ≥ 0. Un duplicado (mismo nombre, marca, sabor y categoría) devuelve 409.
- **Sin descuentos calculados:** la API no aplica la promo; los precios se muestran tal cual.

## Brand Commitments

- **Logo:** «RED» en sans pesada itálica, con relleno blanco, contorno y sombra negros, y «SUPLEMENTOS» en letra de pincel. Lema circular: «Todo en suplementos». Solo negro y blanco sobre gris claro (#E5E5E5). Se permiten variantes, pero no teñirlo de naranja.
- **Paleta (Propuesta de diseño):** gris del logo #e8e8e8, negro y Naranja Energía #d47e30, reservado estrictamente para los llamados a la acción. Sobre el naranja va texto negro, por contraste.
- **Referencia visual (pedido del dueño, 2026-11-06):** el sitio público se parece a los de los gimnasios más importantes del mundo, con muchas animaciones y hovers. Fondo negro, fotos grandes y títulos enormes. El panel de administración queda afuera de esto.
- **Tipografía:** Montserrat para títulos y Open Sans para texto.
- **Estructura (wireframe, obligatoria):**
  1. Navegación con CTA.
  2. Hero: texto a la izquierda, foto a la derecha.
  3. Sobre nosotros: foto a la izquierda, texto a la derecha.
  4. Productos estrella: 1 destacado y una grilla de 3 de categorías distintas.
  5. Footer oscuro con contacto y redes.
- **Tono:** profesionalismo, energía, contraste, fuerza, enfoque y alto rendimiento.
- **Voz:** español rioplatense con voseo, directo.

## Evidence on Hand

- `../docs/marca/logo-original.jpg`: logo oficial (2178 × 1952 px).
- `../docs/marca/fotos/`: 51 fotos reales del Instagram de RED GYM (2021–2025).
  - Socios entrenando entre paredes naranjas, con piso de madera.
  - La fachada del local con el cartel «RED GYM».
  - Una foto de los suplementos reales sobre discos de pesas (`redgym_2022-06-30_Cfbr7jyrFcn.jpg`).
  - Muchas son piezas gráficas con texto encima.
- Los productos de la demo (`../docs/cargar-demo.mjs`) tienen precios ficticios.
- **No existen** testimonios, reseñas, cifras de clientes, premios ni prensa: no se inventan.

## Product Principles

1. Del producto al mensaje en dos toques: ver, comparar y escribirle a la tienda.
2. La verdad del local antes que la estética de categoría: fotos reales de RED GYM, precios y stock reales de la API.
3. Cada acción responde visiblemente: carga, éxito, error y confirmación pasan por un mismo sistema de avisos.
4. El panel es una herramienta: rápido, legible y a prueba de errores antes que expresivo.

## Accessibility & Inclusion

Objetivo WCAG 2.2 AA:

- labels asociados a cada campo;
- navegación completa con teclado;
- contraste AA (por eso, texto negro sobre el naranja);
- `prefers-reduced-motion` respetado;
- áreas táctiles de 44 px o más.

Ningún estado se comunica solo con color. La mayoría de las visitas son desde el celular.
