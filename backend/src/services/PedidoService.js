import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import { Negocio } from "../enums/Negocio.js";
import { Rol } from "../enums/Rol.js";
import { EstadoPedido, NombreEstado } from "../enums/EstadoPedido.js";
import { TipoMovimiento } from "../enums/TipoMovimiento.js";
import validatePedido from "../utils/validatePedido.js";
import validateCambioEstado from "../utils/validateCambioEstado.js";
import { normalizeSearch } from "../utils/normalizeText.js";
import { aCentavos, aPesos, porcentajeDe } from "../utils/dinero.js";

const { PENDIENTE, LISTO_PARA_RETIRAR, ENTREGADO, CANCELADO, VENCIDO } = EstadoPedido;

// Pedidos para retirar en el local (F-04, F-05, F-07). Los pedidos llegan por Instagram
// y los registra el administrador; el cliente con cuenta los sigue y puede cancelarlos mientras están pendientes.
export default class PedidoService {
    constructor({ pedidoRepository, carritoRepository, productoRepository, usuarioRepository,
        stockService, carritoService, reloj }) {
        this.pedidoRepository = pedidoRepository;
        this.carritoRepository = carritoRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
        this.stockService = stockService;
        this.carritoService = carritoService;
        this.reloj = reloj;
    }

    // Confirma el carrito del administrador como pedido. Todo se valida antes de tocar el stock:
    // el pedido se registra completo o no se registra.
    create(admin, data) {
        this.expireOverdue();
        const ahora = this.reloj.ahora();
        const datos = validatePedido(data, ahora);
        const carrito = this.carritoRepository.findByUsuario(admin.idUsuario);
        if (carrito.estaVacio()) throw new BadRequestError(Messages.EMPTY_CART); // V-08
        const registrado = datos.idCliente ? this.#getClient(datos.idCliente) : null;
        const cliente = registrado
            ? { nombre: registrado.nombreCompleto(), contacto: registrado.email, telefono: registrado.telefono }
            : datos.cliente;

        // RN-01: el stock pudo cambiar desde que se armó el carrito, así que se vuelve a controlar.
        const lineas = carrito.items.map(({ idProducto, cantidad }) => {
            const producto = this.productoRepository.findById(idProducto);
            if (!producto?.activo) throw new ConflictError(Messages.PRODUCT_UNAVAILABLE(producto?.nombre ?? `#${idProducto}`));
            if (!producto.hayStock(cantidad)) {
                throw new ConflictError(Messages.INSUFFICIENT_STOCK(producto.nombre, producto.stock));
            }
            return { producto, cantidad };
        });

        // Los precios se copian al pedido: el historial no cambia si después cambia el catálogo.
        const detalles = lineas.map(({ producto, cantidad }) => ({
            idProducto: producto.idProducto,
            nombre: producto.nombre,
            marca: producto.marca,
            sabor: producto.sabor,
            cantidad,
            precioUnitario: producto.precio,
            subtotal: aPesos(aCentavos(producto.precio) * cantidad)
        }));
        const subtotal = detalles.reduce((suma, detalle) => suma + aCentavos(detalle.subtotal), 0);
        const porcentajeDescuento = registrado?.tieneDescuento() ? Negocio.descuentoSocios : 0; // RN-09
        const descuento = porcentajeDe(subtotal, porcentajeDescuento);

        const pedido = this.pedidoRepository.create({
            idCliente: registrado?.idUsuario ?? null,
            cliente,
            idAdminGestor: admin.idUsuario,
            fechaCreacion: ahora.toISOString(),
            fechaRetiro: datos.fechaRetiro,
            horaRetiro: datos.horaRetiro,
            estado: PENDIENTE,
            subtotal: aPesos(subtotal),
            porcentajeDescuento,
            descuento: aPesos(descuento),
            total: aPesos(subtotal - descuento),
            detalles,
            historial: [this.#cambio(PENDIENTE, admin, ahora)]
        });

        // F-06: al confirmar, el stock se descuenta y queda reservado con un movimiento de VENTA por línea.
        const alertasStock = [];
        for (const { producto, cantidad } of lineas) {
            const { producto: actualizado } = this.stockService.registerMovement({
                idProducto: producto.idProducto,
                tipo: TipoMovimiento.VENTA,
                cantidad: -cantidad,
                observacion: `Pedido ${pedido.codigo}`,
                usuario: admin,
                idPedido: pedido.idPedido
            });
            if (actualizado.requiereReposicion()) {
                const { idProducto, nombre, stock, stockMinimo } = actualizado;
                alertasStock.push({ idProducto, nombre, stock, stockMinimo });
            }
        }
        this.carritoRepository.delete(admin.idUsuario);
        return { pedido, alertasStock };
    }

    // El administrador ve todos; el cliente, solo los suyos (F-07).
    getAll(usuario, { estado = null, busqueda = "" } = {}) {
        this.expireOverdue();
        const texto = normalizeSearch(busqueda);
        return this.pedidoRepository.findAll()
            .filter((pedido) => usuario.esAdministrador() || pedido.idCliente === usuario.idUsuario)
            .filter((pedido) => !estado || pedido.estado === estado)
            .filter((pedido) => !texto || normalizeSearch(`${pedido.codigo} ${pedido.cliente.nombre} ${pedido.cliente.contacto}`)
                .includes(texto))
            .sort((a, b) => b.idPedido - a.idPedido);
    }

    getById(usuario, id) {
        this.expireOverdue();
        const pedido = this.pedidoRepository.findById(id);
        // A un cliente, el pedido de otra persona le responde como inexistente.
        if (!pedido || (!usuario.esAdministrador() && pedido.idCliente !== usuario.idUsuario)) {
            throw new NotFoundError(Messages.ORDER_NOT_FOUND);
        }
        return pedido;
    }

    // F-05: el administrador lo marca listo, lo entrega o lo cancela con motivo.
    // El cliente solo puede cancelarlo mientras está pendiente (RN-04).
    changeStatus(usuario, id, data) {
        const { estado, motivo } = validateCambioEstado(data);
        const pedido = this.getById(usuario, id);
        if (!pedido.estaActivo()) throw new ConflictError(Messages.ORDER_CLOSED(NombreEstado[pedido.estado]));
        if (pedido.estado === estado) throw new ConflictError(Messages.SAME_STATUS(NombreEstado[estado]));
        if (usuario.esAdministrador()) this.#checkAdminTransition(pedido, estado, motivo);
        else this.#checkClientTransition(pedido, estado);

        const ahora = this.reloj.ahora();
        const cambios = {
            ...pedido,
            estado,
            historial: [...pedido.historial, this.#cambio(estado, usuario, ahora, motivo)]
        };
        if (usuario.esAdministrador()) cambios.idAdminGestor = usuario.idUsuario;
        if (estado === ENTREGADO) {
            cambios.fechaEntrega = ahora.toISOString();
            cambios.fechaCierre = ahora.toISOString();
        }
        if (estado === CANCELADO) {
            cambios.motivoCancelacion = motivo || "Lo canceló el cliente desde su cuenta.";
            cambios.fechaCierre = ahora.toISOString();
            this.#returnStock(pedido, usuario, `Pedido ${pedido.codigo} cancelado`); // RN-05
        }
        return this.pedidoRepository.update(id, cambios);
    }

    // F-07: "repetir una compra" carga los productos del pedido en el carrito, con el stock de hoy.
    repeat(admin, id) {
        const pedido = this.getById(admin, id);
        const carrito = this.carritoRepository.findByUsuario(admin.idUsuario);
        const avisos = [];
        let agregados = 0;
        for (const detalle of pedido.detalles) {
            const producto = this.productoRepository.findById(detalle.idProducto);
            if (!producto?.activo) {
                avisos.push(`«${detalle.nombre}» ya no está a la venta.`);
                continue;
            }
            const disponible = producto.stock - carrito.cantidadDe(producto.idProducto);
            if (disponible <= 0) {
                avisos.push(`«${producto.nombre}» no tiene stock para agregar.`);
                continue;
            }
            if (!carrito.tiene(producto.idProducto) && carrito.items.length >= Negocio.maxProductosCarrito) {
                avisos.push(Messages.CART_TOO_LARGE);
                break;
            }
            const cantidad = Math.min(detalle.cantidad, disponible);
            if (cantidad < detalle.cantidad) {
                const hay = disponible === 1 ? "1 unidad" : `${disponible} unidades`;
                avisos.push(`De «${producto.nombre}» había ${hay} en stock: se agregó esa cantidad.`);
            }
            carrito.fijarCantidad(producto.idProducto, carrito.cantidadDe(producto.idProducto) + cantidad);
            agregados++;
        }
        if (agregados === 0) throw new ConflictError(Messages.NOTHING_TO_REPEAT);
        this.carritoRepository.save(carrito);
        const idCliente = pedido.idCliente && this.usuarioRepository.findById(pedido.idCliente)?.activo
            ? pedido.idCliente
            : null;
        return {
            carrito: this.carritoService.get(admin.idUsuario, { idCliente }),
            avisos,
            idCliente,
            cliente: pedido.cliente
        };
    }

    // RN-06: lo que no se retiró 48 h después de la franja acordada pasa a VENCIDO y libera el stock.
    // Se ejecuta antes de cada consulta de pedidos y, además, cada minuto desde server.js.
    expireOverdue() {
        const ahora = this.reloj.ahora();
        let vencidos = 0;
        for (const pedido of this.pedidoRepository.findAll()) {
            if (!pedido.estaVencido(ahora)) continue;
            const momento = pedido.vencimiento();
            this.#returnStock(pedido, null, `Pedido ${pedido.codigo} vencido`, momento);
            this.pedidoRepository.update(pedido.idPedido, {
                ...pedido,
                estado: VENCIDO,
                motivoCancelacion: "No se retiró dentro de las 48 horas posteriores al horario acordado.",
                fechaCierre: momento.toISOString(),
                historial: [...pedido.historial, this.#cambio(VENCIDO, null, momento)]
            });
            vencidos++;
        }
        return vencidos;
    }

    #checkAdminTransition(pedido, estado, motivo) {
        if (estado === CANCELADO) {
            if (motivo.length < 5) throw new BadRequestError(Messages.CANCEL_REASON_REQUIRED);
            return;
        }
        if (estado === ENTREGADO && pedido.estado !== LISTO_PARA_RETIRAR) {
            throw new ConflictError(Messages.MUST_BE_READY_FIRST);
        }
    }

    #checkClientTransition(pedido, estado) {
        if (estado !== CANCELADO) throw new ForbiddenError(Messages.CLIENT_ONLY_CANCEL);
        if (pedido.estado !== PENDIENTE) throw new ConflictError(Messages.CLIENT_CANCEL_ONLY_PENDING);
    }

    #returnStock(pedido, usuario, observacion, fecha = null) {
        for (const detalle of pedido.detalles) {
            this.stockService.registerMovement({
                idProducto: detalle.idProducto,
                tipo: TipoMovimiento.DEVOLUCION,
                cantidad: detalle.cantidad,
                observacion,
                usuario,
                idPedido: pedido.idPedido,
                fecha
            });
        }
    }

    #getClient(idCliente) {
        const cliente = this.usuarioRepository.findById(idCliente);
        if (!cliente || cliente.rol !== Rol.CLIENTE || !cliente.activo) throw new NotFoundError(Messages.CLIENT_NOT_FOUND);
        return cliente;
    }

    // Entrada del historial: qué estado, cuándo y quién (el sistema cuando vence solo).
    #cambio(estado, usuario, fecha, nota = "") {
        return {
            estado,
            fecha: fecha.toISOString(),
            idUsuario: usuario?.idUsuario ?? null,
            nombreUsuario: usuario ? usuario.nombreCompleto() : "Sistema",
            rol: usuario?.rol ?? null,
            nota
        };
    }
}
