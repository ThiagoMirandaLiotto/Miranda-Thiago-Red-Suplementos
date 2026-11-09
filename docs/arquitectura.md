# Arquitectura de la Entrega 2

## Dominio y elección de la entidad

RED SUPLEMENTOS necesita organizar el catálogo y evitar inconsistencias de inventario. Aunque Pedido es la entidad central del flujo de ventas, el análisis del sistema identifica expresamente Producto como el CRUD principal. Por eso esta entrega implementa Producto y consulta Categoria como relación auxiliar.

El modelo de Producto conserva los atributos del diagrama de clases: idProducto, nombre, marca, idCategoria, descripcion, precio, stock, stockMinimo, sabor, imagen y activo. La categoría se representa mediante su ID; cada producto pertenece a una categoría.

## Recorrido de una solicitud

Una solicitud POST entra por `productoRoutes`. El middleware `requireJson` controla el tipo de contenido. `ProductoController.create` toma `req.body` e invoca a `ProductoService.create`. El servicio valida los atributos, comprueba la categoría y descarta duplicados. `ProductoRepository.create` asigna un ID y agrega una instancia de Producto al array. El controlador devuelve HTTP 201 mediante `ApiResponse.success`.

Si alguna validación falla, se lanza un error que hereda de `AppError`. El middleware final `errorHandler` convierte ese error en una respuesta JSON uniforme. Los controladores no repiten bloques try/catch: Express captura los errores síncronos; la versión utilizada también maneja rechazos de promesas devueltas por handlers.

## Separación de responsabilidades

Los servicios no usan objetos de Express. Los repositorios no deciden si un producto puede venderse, ni construyen respuestas HTTP: únicamente gestionan registros. Las utilidades validan formas y valores; el servicio decide qué reglas aplicar. Los modelos representan el dominio y contienen consultas simples de estado (`hayStock` y `stockCritico`).

Los métodos de persistencia y HTTP que aparecían en el modelo conceptual se distribuyen entre capas: crear/editar producto corresponde al servicio y al repositorio, y enviar su resultado corresponde al controlador. No se implementan métodos vacíos para funcionalidades futuras.

La instancia del repositorio se crea una vez por aplicación y se comparte mediante los constructores. No se recrea por solicitud. Cada repositorio mantiene un array privado y entrega copias de sus entidades, por lo que un consumidor no modifica accidentalmente el almacenamiento.

## Decisiones de alcance

1. Se utiliza JavaScript con módulos ES y Express porque la consigna presenta ejemplos con `export` y una API HTTP. No se adjuntó un repositorio de código para conservar un framework anterior.
2. El CRUD comienza sin productos. Las cinco categorías del análisis se precargan como datos de referencia, también en un array.
3. La eliminación siempre es lógica: evita borrar referencias históricas cuando se implemente Pedido y sigue F-02. El listado y la consulta por ID exponen solo productos activos.
4. PUT reemplaza todos los atributos editables. Los opcionales omitidos se restablecen a sus valores por defecto.
5. La unicidad por nombre, marca, sabor y categoría es una decisión adicional de esta implementación. El diagrama no define SKU ni una clave única de Producto.
6. El precio sigue el tipo numérico solicitado y se limita a dos decimales. Esta entrega no calcula totales ni descuentos; cuando se implemente Pedido deberá definirse su aritmética monetaria.
7. La API local no implementa autenticación ni pretende satisfacer todavía RN-10. El stock es una cantidad editable, sin el módulo de movimientos, reservas o ventas.
8. Se entrega la API y su documentación; la landing del mockup no se implementa en esta etapa.

## Correspondencia con la evaluación

| Requisito | Evidencia en el proyecto |
| --- | --- |
| Diez carpetas solicitadas | backend/src contiene todas y cada una tiene código funcional. |
| Una responsabilidad por capa | Routes, controllers, services, repositories y models separados. |
| Obtener todos | GET /api/productos. |
| Obtener por ID | GET /api/productos/:id. |
| Crear | POST /api/productos. |
| Modificar | PUT /api/productos/:id. |
| Eliminar | DELETE /api/productos/:id, mediante activo=false. |
| Persistencia en arrays | #productos y #categorias en sus repositorios. |
| Enum de mensajes | enums/Messages.js con Object.freeze. |
| AppError | exceptions/AppError.js y sus subclases. |
| Errores centralizados | middlewares/errorHandler.js. |
| Respuestas consistentes | responses/ApiResponse.js. |
| Verificación funcional | backend/test/productos.test.js. |

## Documentos de referencia revisados

- **Analisis del Sistema RED SUPLEMENTOS 1.docx:** F-02, V-01, V-05, RN-08, Anexo A y relación Categoria → Producto del Anexo B.
- **Diagrama de Clases RED SUPLEMENTOS.dc.html:** atributos de Producto y Categoria, y contexto de las demás entidades.
- **ModeloBorrador.png:** esquema general Usuario, Pedido, Producto, Categoria y Movimiento stock.
- **Wireframe Combinada RED SUPLEMENTOS.pdf:** navegación y estructura de la landing futura.
- **Mockup RED SUPLEMENTOS.pdf:** catálogo y presentación visual del negocio.
- **Propuesta de Diseño Web - RED SUPLEMENTOS.docx:** contexto comercial y dirección visual.

El análisis describe una plataforma de pedidos más amplia que la landing orientada a WhatsApp. Para el alcance funcional del backend se prioriza el análisis y el diagrama de clases; la propuesta, el wireframe y el mockup se toman como referencias del frontend.
