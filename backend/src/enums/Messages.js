// Mensajes de la API. Los que dependen de datos del pedido o del producto son funciones.
const unidades = (cantidad) => `${cantidad} ${cantidad === 1 ? "unidad" : "unidades"}`;

export const Messages = Object.freeze({
    PRODUCT_NOT_FOUND: "El producto no existe.",
    CATEGORY_NOT_FOUND: "La categoría no existe o está inactiva.",
    INVALID_DATA: "Los datos enviados son inválidos.",
    INVALID_ID: "El ID debe ser un número entero positivo.",
    INVALID_NAME: "El nombre es obligatorio y debe ser un texto de hasta 120 caracteres.",
    INVALID_CATEGORY: "idCategoria debe ser un número entero positivo.",
    INVALID_PRICE: "El precio debe ser un número mayor que cero, de hasta dos decimales y menor o igual a 1000000000.",
    INVALID_STOCK: "El stock es obligatorio y debe ser un número entero mayor o igual a cero.",
    INVALID_MINIMUM_STOCK: "stockMinimo debe ser un número entero mayor o igual a cero.",
    INVALID_TEXT: "Marca y sabor admiten hasta 120 caracteres; descripción e imagen, hasta 2000. Deben ser textos.",
    UNKNOWN_FIELDS: "El cuerpo contiene campos no permitidos. No se pueden asignar idProducto ni activo.",
    DUPLICATED_RESOURCE: "Ya existe un producto activo con el mismo nombre, marca, sabor y categoría.",
    INVALID_JSON: "El cuerpo de la solicitud contiene un JSON inválido.",
    UNSUPPORTED_MEDIA_TYPE: "El cuerpo debe enviarse como application/json con una codificación admitida y sin compresión.",
    PAYLOAD_TOO_LARGE: "El cuerpo de la solicitud supera el límite de 100 KB.",
    ROUTE_NOT_FOUND: "La ruta solicitada no existe.",
    METHOD_NOT_ALLOWED: "El método HTTP no está permitido para esta ruta.",
    INTERNAL_SERVER_ERROR: "Ocurrió un error interno en el servidor.",
    SERVER_STARTED: "API RED SUPLEMENTOS iniciada en el puerto",
    SERVER_START_ERROR: "No se pudo iniciar el servidor.",
    INVALID_PORT: "PORT debe ser un entero entre 1 y 65535.",

    // Cuerpos de las rutas nuevas
    FIELDS_NOT_ALLOWED: "El cuerpo contiene campos no permitidos.",

    // Sesión y permisos (F-01, RN-02, RN-10)
    UNAUTHORIZED: "Iniciá sesión para continuar.",
    SESSION_EXPIRED: "Tu sesión venció. Volvé a iniciar sesión.",
    FORBIDDEN: "No tenés permiso para realizar esta acción.",
    INVALID_CREDENTIALS: "El email o la contraseña no son correctos.",
    MISSING_CREDENTIALS: "Ingresá tu email y tu contraseña.",
    INVALID_ADMIN_CONFIG: "ADMIN_EMAIL y ADMIN_CONTRASENA deben ser un email válido y una contraseña de al menos 8 caracteres con letras y números.",

    // Registro y perfil (V-01, V-02, V-03, V-07, RN-07)
    INVALID_FIRST_NAME: "El nombre es obligatorio y puede tener hasta 60 caracteres.",
    INVALID_LAST_NAME: "El apellido es obligatorio y puede tener hasta 60 caracteres.",
    INVALID_EMAIL: "Ingresá un email válido, con el formato nombre@dominio.com.",
    EMAIL_TAKEN: "Ya existe una cuenta con ese email.",
    INVALID_PHONE: "El teléfono debe tener solo números, entre 8 y 15 dígitos.",
    INVALID_PASSWORD: "La contraseña debe tener entre 8 y 128 caracteres, con al menos una letra y un número.",
    PASSWORD_MISMATCH: "La confirmación no coincide con la contraseña.",
    INVALID_MEMBER_FLAG: "esSocioGym debe ser true o false.",

    // Clientes y membresía (RN-09)
    CLIENT_NOT_FOUND: "El cliente no existe.",
    INVALID_MEMBERSHIP: "membresiaActiva debe ser true o false.",

    // Carrito (RN-01, V-04, V-08)
    INVALID_PRODUCT_ID: "idProducto debe ser un número entero positivo.",
    INVALID_QUANTITY: "La cantidad debe ser un número entero mayor que cero.",
    PRODUCT_NOT_IN_CART: "Ese producto no está en el carrito.",
    EMPTY_CART: "El carrito está vacío: agregá al menos un producto.",
    CART_TOO_LARGE: "El carrito admite hasta 30 productos distintos.",
    INSUFFICIENT_STOCK: (nombre, disponible, enCarrito = 0) => {
        if (disponible === 0) return `«${nombre}» no tiene stock.`;
        if (enCarrito > 0) {
            return `Stock insuficiente para «${nombre}»: hay ${unidades(disponible)} y ya tenés ${enCarrito} en el carrito.`;
        }
        return `Stock insuficiente para «${nombre}»: hay ${unidades(disponible)}.`;
    },
    PRODUCT_UNAVAILABLE: (nombre) => `«${nombre}» ya no está a la venta: quitalo del carrito.`,

    // Pedidos (F-04, F-05, RN-03, RN-04, RN-05, V-06)
    ORDER_NOT_FOUND: "El pedido no existe.",
    INVALID_CLIENT_REF: "Indicá un cliente registrado (idCliente) o el nombre y el contacto de quien retira (cliente), pero no los dos.",
    INVALID_CLIENT_ID: "idCliente debe ser un número entero positivo.",
    INVALID_GUEST_NAME: "El nombre de quien retira es obligatorio y puede tener hasta 80 caracteres.",
    INVALID_GUEST_CONTACT: "El contacto debe ser un usuario de Instagram (por ejemplo @usuario) o un teléfono de 8 a 15 dígitos.",
    INVALID_PICKUP_DATE: "La fecha de retiro debe ser una fecha válida con el formato AAAA-MM-DD.",
    PAST_PICKUP_DATE: "La fecha de retiro no puede ser anterior a hoy.",
    PICKUP_TOO_FAR: "El retiro se puede programar hasta 30 días después de hoy.",
    INVALID_PICKUP_TIME: "La hora de retiro debe ser el inicio de una franja entre las 7:00 y las 22:00, por ejemplo 18:00.",
    PICKUP_TIME_PASSED: "Esa franja de hoy ya terminó: elegí una más tarde u otro día.",
    INVALID_STATUS: "El estado debe ser LISTO_PARA_RETIRAR, ENTREGADO o CANCELADO.",
    INVALID_REASON: "El motivo puede tener hasta 300 caracteres.",
    CANCEL_REASON_REQUIRED: "Indicá el motivo de la cancelación, con al menos 5 caracteres.",
    ORDER_CLOSED: (estado) => `El pedido ya está ${estado} y no admite cambios.`,
    SAME_STATUS: (estado) => `El pedido ya está ${estado}.`,
    MUST_BE_READY_FIRST: "Primero marcá el pedido como listo para retirar.",
    CLIENT_ONLY_CANCEL: "Desde tu cuenta solo podés cancelar un pedido.",
    CLIENT_CANCEL_ONLY_PENDING: "Solo podés cancelar un pedido mientras está pendiente. Si ya está listo, escribinos por Instagram.",
    NOTHING_TO_REPEAT: "Ningún producto de ese pedido tiene stock hoy.",

    // Stock (F-06)
    INVALID_MOVEMENT_TYPE: "El tipo debe ser INGRESO o AJUSTE. Las ventas y las devoluciones se registran con los pedidos.",
    INVALID_INCOME_QUANTITY: "La cantidad del ingreso debe ser un número entero entre 1 y 100000.",
    INVALID_ADJUSTMENT_QUANTITY: "El ajuste debe ser un número entero distinto de cero (negativo para descontar), de hasta 100000 unidades.",
    ADJUSTMENT_REASON_REQUIRED: "Indicá el motivo del ajuste, entre 3 y 200 caracteres.",
    INVALID_OBSERVATION: "La observación puede tener hasta 200 caracteres.",
    NEGATIVE_STOCK: (nombre, stock) => `El ajuste dejaría a «${nombre}» con stock negativo: hoy tiene ${unidades(stock)}.`,

    // Reportes (F-08)
    INVALID_PERIOD: "El período debe tener fechas AAAA-MM-DD válidas, con «desde» anterior o igual a «hasta» y hasta 366 días.",
    INVALID_LIMIT: "El límite debe ser un número entero entre 1 y 20.",
    INVALID_STATUS_FILTER: "El filtro de estado debe ser PENDIENTE, LISTO_PARA_RETIRAR, ENTREGADO, CANCELADO o VENCIDO.",

    // Datos de demostración
    DEMO_DATA_LOADED: "Datos de demostración cargados. Para arrancar vacía: DATOS_DEMO=no."
});
