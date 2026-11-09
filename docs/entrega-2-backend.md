# RED SUPLEMENTOS — Entrega 2: Arquitectura MVC

> Documentación original de la Entrega 2, que sigue siendo la referencia de la API. Las rutas son relativas a la raíz del repositorio. La Entrega 3 está descripta en el README de la raíz.

Backend de la tienda de suplementos deportivos RED SUPLEMENTOS, ubicada dentro de RED GYM. Implementa el CRUD de **Producto**, definido como CRUD principal en F-02 y en el Anexo A del análisis del sistema. Está organizado en las diez carpetas solicitadas y almacena los registros en arrays.

## Ejecutar

Requisito: Node.js 22 o superior, con npm. Abrir esta carpeta en Visual Studio Code, abrir una terminal y ejecutar:

```bash
cd backend
npm ci
npm start
```

La API estará en `http://localhost:3000/api/productos`. Al abrir esa dirección en el navegador, inicialmente se verá `{"success":true,"data":[]}`. Para crear o modificar productos se usa Postman, un cliente HTTP o los ejemplos de `docs/solicitudes.http`.

- Desarrollo con reinicio automático: `npm run dev`.
- Pruebas automatizadas: `npm test`, desde `backend`.
- Detener el servidor: `Ctrl+C`.
- Puerto opcional: variable de entorno `PORT`. No hace falta un archivo `.env`.
- Se escucha en la máquina local (`127.0.0.1`). Es una entrega académica sin autenticación: no implementa todavía los permisos de administrador RN-10.

**Al reiniciar el proceso se pierden los productos.** Las cinco categorías vuelven a cargarse. Este comportamiento cumple la persistencia temporal en memoria solicitada.

## Alcance

Se entrega una API JSON con CRUD completo de Producto y consulta auxiliar de categorías. El análisis del sistema y el diagrama de clases guían los campos y las reglas. Los mockups, el wireframe y la propuesta visual contextualizan el futuro frontend; esta entrega no incluye pantallas.

Se implementan V-01 y V-05 para productos y la baja lógica de F-02/RN-08. Pedidos, usuarios, sesiones, permisos, membresías, descuentos, movimientos de stock, reportes y notificaciones quedan pendientes de sus respectivas etapas. Modificar `stock` aquí cambia el valor en el array; todavía no registra movimientos ni reservas.

## Estructura y responsabilidades

| Carpeta dentro de backend/src | Responsabilidad |
| --- | --- |
| controllers | Recibir datos HTTP, invocar servicios y enviar respuestas. |
| services | Validar datos y aplicar reglas de negocio: categoría existente, duplicados y baja lógica. |
| repositories | Leer y escribir los arrays; asignar IDs correlativos. |
| models | Representar Producto y Categoria con sus atributos de dominio. |
| routes | Asociar URL y método HTTP con un controlador. |
| middlewares | Validar formato JSON, resolver rutas/métodos inválidos y manejar errores. |
| responses | Construir respuestas uniformes mediante ApiResponse. |
| exceptions | Definir AppError y errores específicos con códigos HTTP. |
| enums | Centralizar mensajes en Messages, protegido con Object.freeze. |
| utils | Validar atributos, interpretar IDs y normalizar textos. |

`app.js` conecta las dependencias y registra middlewares en orden. `server.js` inicia el servidor. Los controladores no manipulan arrays y los repositorios no conocen `req`, `res` ni códigos HTTP.

En esta API, el **Modelo** se distribuye entre entidades, servicios y repositorios; el **Controlador** coordina las solicitudes. La representación de salida se serializa como JSON mediante `responses`. No hay vistas HTML ni un motor de plantillas: el futuro frontend consumirá la API.

## Endpoints

| Método | Ruta | Resultado correcto |
| --- | --- | --- |
| GET | /api/productos | 200; productos activos, o array vacío. |
| GET | /api/productos/:id | 200; producto activo por ID. |
| POST | /api/productos | 201; producto creado y cabecera Location. |
| PUT | /api/productos/:id | 200; reemplazo de los datos editables. |
| DELETE | /api/productos/:id | 200; producto con activo=false. |
| GET | /api/categorias | 200; categorías activas para cargar productos. |

`PUT` requiere todos los campos obligatorios; los opcionales omitidos recuperan sus valores por defecto. No se implementa actualización parcial con PATCH. Los parámetros de consulta no agregan filtros en esta versión.

`DELETE` realiza baja lógica para todos los productos, siguiendo F-02 y cubriendo RN-08 sin depender de un módulo de pedidos. Se devuelve 200 con JSON para conservar el formato solicitado. El producto permanece en el array y desaparece de las consultas públicas. Consultarlo, modificarlo o eliminarlo de nuevo devuelve 404. Los IDs no se reutilizan dentro del mismo proceso.

## Datos de Producto

| Campo | Tipo / regla |
| --- | --- |
| idProducto | Entero positivo generado por el repositorio; no se recibe en el cuerpo. |
| nombre | Obligatorio; texto no vacío, hasta 120 caracteres. |
| idCategoria | Obligatorio; entero positivo que identifica una categoría activa. |
| precio | Obligatorio; número mayor que 0, hasta 2 decimales; máximo técnico 1000000000. |
| stock | Obligatorio; entero seguro mayor o igual a 0. |
| marca, sabor | Textos opcionales de hasta 120 caracteres; por defecto "". |
| descripcion, imagen | Textos opcionales de hasta 2000 caracteres; por defecto "". |
| stockMinimo | Entero seguro mayor o igual a 0; por defecto 0. |
| activo | Booleano administrado por el servicio; comienza en true. |

Los campos desconocidos se rechazan. No se convierten cadenas a números: enviar `"stock":"10"` es inválido. Se recortan los espacios externos de los textos. `imagen` es una referencia textual; no sube ni descarga archivos.

**Decisiones de implementación:** los límites de texto/precio y la regla de duplicados se agregan para esta entrega; no aparecen definidos de esa forma en los documentos. Se considera duplicado un producto activo con igual nombre, marca, sabor y categoría, ignorando mayúsculas y espacios repetidos. Diferentes presentaciones deben distinguirse en `nombre` (por ejemplo, “Creatina 300 g”). Se puede crear nuevamente una combinación dada de baja, con un ID nuevo.

Categorías iniciales:

| idCategoria | nombre |
| --- | --- |
| 1 | Proteínas |
| 2 | Creatina |
| 3 | Pre-entreno |
| 4 | Aminoácidos |
| 5 | Barras proteicas |

## Ejemplo de creación

Enviar POST a `http://localhost:3000/api/productos` con `Content-Type: application/json` y cuerpo JSON:

```json
{
    "nombre": "Creatina monohidrato 300 g",
    "marca": "Star Nutrition",
    "idCategoria": 2,
    "descripcion": "Producto de demostración",
    "precio": 25000.50,
    "stock": 10,
    "stockMinimo": 3,
    "sabor": "Sin sabor",
    "imagen": ""
}
```

El precio y el stock del ejemplo son ficticios. Tras crear el primer registro, consultar `/api/productos/1`. Para modificarlo, enviar el mismo cuerpo completo por PUT a esa dirección cambiando los valores. Para darlo de baja, enviar DELETE sin cuerpo.

## Respuestas y errores

Formato de éxito (ejemplo de listado vacío):

```json
{ "success": true, "data": [] }
```

Formato de error:

```json
{ "success": false, "message": "El producto no existe." }
```

| Código | Uso |
| --- | --- |
| 400 | Datos o ID inválidos, categoría inexistente, JSON mal formado. |
| 404 | Producto inexistente/inactivo o ruta inexistente. |
| 405 | Método no implementado para una ruta conocida; incluye Allow. |
| 409 | Producto duplicado. |
| 413 | Cuerpo superior a 100 KB. |
| 415 | Content-Type o codificación no admitidos. |
| 500 | Error inesperado, sin exponer detalles internos al cliente. |

Los servicios lanzan subclases de `AppError`. Express conduce los errores al middleware `errorHandler`, registrado al final. Este también transforma errores del parser JSON al formato de la API. Los detalles de errores inesperados solo se registran en el servidor. HEAD, por definición HTTP, no devuelve cuerpo.

## Verificación

`npm test` usa el ejecutor de pruebas incluido en Node y solicitudes HTTP reales a un puerto local temporal. Cubre el ciclo CRUD, bajas conservadas en el array, duplicados al crear/editar, IDs, validaciones, JSON inválido, tamaño del cuerpo, 404, 405, 409, 413, 415 y 500. También comprueba que los datos se reinicien entre aplicaciones y que una escritura rechazada no modifique el registro.

## Material complementario

- `docs/arquitectura.md`: explicación de diseño y correspondencia con la consigna.
- `docs/solicitudes.http`: secuencia de solicitudes para ejecutar manualmente.
- `backend/test/productos.test.js`: pruebas reproducibles.
- `backend/package-lock.json`: dependencias fijadas para instalar con `npm ci`.
