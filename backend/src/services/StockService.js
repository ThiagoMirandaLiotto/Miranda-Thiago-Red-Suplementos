import { ConflictError, NotFoundError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import validateMovimiento from "../utils/validateMovimiento.js";

// F-06: todo cambio de stock pasa por acá y deja su movimiento (tipo, cantidad, fecha y quién lo hizo).
export default class StockService {
    constructor(productoRepository, movimientoRepository, reloj) {
        this.productoRepository = productoRepository;
        this.movimientoRepository = movimientoRepository;
        this.reloj = reloj;
    }

    // cantidad con signo. Devuelve el producto actualizado y el movimiento registrado.
    registerMovement({ idProducto, tipo, cantidad, observacion = "", usuario = null, idPedido = null, fecha = null }) {
        const producto = this.productoRepository.findById(idProducto);
        if (!producto) throw new NotFoundError(Messages.PRODUCT_NOT_FOUND);
        const stockResultante = producto.stock + cantidad;
        if (stockResultante < 0) throw new ConflictError(Messages.NEGATIVE_STOCK(producto.nombre, producto.stock));
        const actualizado = this.productoRepository.update(idProducto, { ...producto, stock: stockResultante });
        const movimiento = this.movimientoRepository.create({
            idProducto,
            tipo,
            cantidad,
            stockResultante,
            fecha: (fecha ?? this.reloj.ahora()).toISOString(),
            observacion,
            idUsuario: usuario?.idUsuario ?? null,
            nombreUsuario: usuario ? usuario.nombreCompleto() : "Sistema",
            idPedido
        });
        return { producto: actualizado, movimiento };
    }

    // Ingreso de mercadería o ajuste cargado por el administrador desde el panel.
    applyManualMovement(usuario, idProducto, data) {
        const datos = validateMovimiento(data);
        this.#getActive(idProducto);
        const { producto, movimiento } = this.registerMovement({ ...datos, idProducto, usuario });
        return { producto, movimiento, alertaStock: producto.requiereReposicion() };
    }

    getMovements(idProducto) {
        if (!this.productoRepository.findById(idProducto)) throw new NotFoundError(Messages.PRODUCT_NOT_FOUND);
        return this.movimientoRepository.findByProducto(idProducto)
            .sort((a, b) => b.idMovimiento - a.idMovimiento);
    }

    #getActive(idProducto) {
        const producto = this.productoRepository.findById(idProducto);
        if (!producto || !producto.activo) throw new NotFoundError(Messages.PRODUCT_NOT_FOUND);
        return producto;
    }
}
