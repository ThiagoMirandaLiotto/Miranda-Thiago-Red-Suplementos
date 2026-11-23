import { BadRequestError, ConflictError, NotFoundError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import { Negocio } from "../enums/Negocio.js";
import { Rol } from "../enums/Rol.js";
import { validateCantidad, validateNuevoItem } from "../utils/validateItemCarrito.js";
import { aCentavos, aPesos, porcentajeDe } from "../utils/dinero.js";

// Carrito con el que el administrador arma el pedido que le llegó por Instagram (F-04).
// Cada cambio se valida contra el stock real (RN-01, V-04).
export default class CarritoService {
    constructor(carritoRepository, productoRepository, usuarioRepository) {
        this.carritoRepository = carritoRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // Con idCliente se muestra el descuento que tendría ese cliente (RN-09).
    get(idUsuario, { idCliente = null } = {}) {
        return this.#view(this.carritoRepository.findByUsuario(idUsuario), idCliente);
    }

    addItem(idUsuario, data) {
        const { idProducto, cantidad } = validateNuevoItem(data);
        const producto = this.#getActive(idProducto);
        const carrito = this.carritoRepository.findByUsuario(idUsuario);
        if (!carrito.tiene(idProducto) && carrito.items.length >= Negocio.maxProductosCarrito) {
            throw new BadRequestError(Messages.CART_TOO_LARGE);
        }
        const enCarrito = carrito.cantidadDe(idProducto);
        if (!producto.hayStock(enCarrito + cantidad)) {
            throw new ConflictError(Messages.INSUFFICIENT_STOCK(producto.nombre, producto.stock, enCarrito));
        }
        carrito.fijarCantidad(idProducto, enCarrito + cantidad);
        return this.#view(this.carritoRepository.save(carrito));
    }

    updateItem(idUsuario, idProducto, data) {
        const { cantidad } = validateCantidad(data);
        const carrito = this.carritoRepository.findByUsuario(idUsuario);
        if (!carrito.tiene(idProducto)) throw new NotFoundError(Messages.PRODUCT_NOT_IN_CART);
        const producto = this.#getActive(idProducto);
        if (!producto.hayStock(cantidad)) {
            throw new ConflictError(Messages.INSUFFICIENT_STOCK(producto.nombre, producto.stock));
        }
        carrito.fijarCantidad(idProducto, cantidad);
        return this.#view(this.carritoRepository.save(carrito));
    }

    removeItem(idUsuario, idProducto) {
        const carrito = this.carritoRepository.findByUsuario(idUsuario);
        if (!carrito.tiene(idProducto)) throw new NotFoundError(Messages.PRODUCT_NOT_IN_CART);
        carrito.quitar(idProducto);
        return this.#view(this.carritoRepository.save(carrito));
    }

    clear(idUsuario) {
        this.carritoRepository.delete(idUsuario);
        return this.#view(this.carritoRepository.findByUsuario(idUsuario));
    }

    #getActive(idProducto) {
        const producto = this.productoRepository.findById(idProducto);
        if (!producto || !producto.activo) throw new NotFoundError(Messages.PRODUCT_NOT_FOUND);
        return producto;
    }

    // Vista con precios actuales, subtotales y avisos por línea. Los importes los calcula la API, no el navegador.
    #view(carrito, idCliente = null) {
        const items = carrito.items.map(({ idProducto, cantidad }) => {
            const producto = this.productoRepository.findById(idProducto);
            const disponible = producto?.activo ? producto.stock : 0;
            let problema = null;
            if (!producto?.activo) problema = Messages.PRODUCT_UNAVAILABLE(producto?.nombre ?? `#${idProducto}`);
            else if (cantidad > disponible) problema = Messages.INSUFFICIENT_STOCK(producto.nombre, disponible);
            return {
                idProducto,
                nombre: producto?.nombre ?? "",
                marca: producto?.marca ?? "",
                sabor: producto?.sabor ?? "",
                imagen: producto?.imagen ?? "",
                idCategoria: producto?.idCategoria ?? null,
                precioUnitario: producto?.precio ?? 0,
                cantidad,
                stockDisponible: disponible,
                subtotal: aPesos(aCentavos(producto?.precio ?? 0) * cantidad),
                problema
            };
        });
        const subtotal = items.reduce((suma, item) => suma + aCentavos(item.subtotal), 0);
        const cliente = idCliente ? this.usuarioRepository.findById(idCliente) : null;
        if (idCliente && (!cliente || cliente.rol !== Rol.CLIENTE)) throw new NotFoundError(Messages.CLIENT_NOT_FOUND);
        const porcentajeDescuento = cliente?.tieneDescuento() ? Negocio.descuentoSocios : 0;
        const descuento = porcentajeDe(subtotal, porcentajeDescuento);
        return {
            items,
            unidades: items.reduce((suma, item) => suma + item.cantidad, 0),
            subtotal: aPesos(subtotal),
            porcentajeDescuento,
            descuento: aPesos(descuento),
            total: aPesos(subtotal - descuento),
            listoParaConfirmar: items.length > 0 && items.every((item) => item.problema === null)
        };
    }
}
