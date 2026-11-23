import { ConflictError, NotFoundError, BadRequestError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import { TipoMovimiento } from "../enums/TipoMovimiento.js";
import validateProducto from "../utils/validateProducto.js";
import normalizeText from "../utils/normalizeText.js";

export default class ProductoService {
    constructor(productoRepository, categoriaRepository, stockService) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
        this.stockService = stockService;
    }

    getAll() {
        return this.productoRepository.findAll().filter((producto) => producto.activo);
    }

    getById(id) {
        const producto = this.productoRepository.findById(id);
        if (!producto || !producto.activo) {
            throw new NotFoundError(Messages.PRODUCT_NOT_FOUND);
        }
        return producto;
    }

    // El stock inicial entra como un INGRESO: así el historial explica cada unidad.
    create(data, usuario = null) {
        const validData = validateProducto(data);
        this.validateBusinessRules(validData);
        const producto = this.productoRepository.create({ ...validData, stock: 0 });
        if (validData.stock === 0) return producto;
        return this.stockService.registerMovement({
            idProducto: producto.idProducto,
            tipo: TipoMovimiento.INGRESO,
            cantidad: validData.stock,
            observacion: "Stock inicial",
            usuario
        }).producto;
    }

    // Sin "stock" se conserva el actual. Si llega distinto, la diferencia queda como AJUSTE.
    update(id, data, usuario = null) {
        const actual = this.getById(id);
        const validData = validateProducto(data, { stockOpcional: true });
        this.validateBusinessRules(validData, id);
        const { stock, ...cambios } = validData;
        const producto = this.productoRepository.update(id, { ...cambios, stock: actual.stock, activo: true });
        if (stock === undefined || stock === actual.stock) return producto;
        return this.stockService.registerMovement({
            idProducto: id,
            tipo: TipoMovimiento.AJUSTE,
            cantidad: stock - actual.stock,
            observacion: "Corrección desde la edición del producto",
            usuario
        }).producto;
    }

    delete(id) {
        const producto = this.getById(id);
        // Baja lógica (RN-08): el registro sigue disponible para el historial de pedidos.
        return this.productoRepository.update(id, { ...producto, activo: false });
    }

    validateBusinessRules(data, excludedId = null) {
        const categoria = this.categoriaRepository.findById(data.idCategoria);
        if (!categoria || !categoria.activa) {
            throw new BadRequestError(Messages.CATEGORY_NOT_FOUND);
        }
        const duplicated = this.getAll().some((producto) =>
            producto.idProducto !== excludedId
            && producto.idCategoria === data.idCategoria
            && ["nombre", "marca", "sabor"].every((field) =>
                normalizeText(producto[field]) === normalizeText(data[field])));
        if (duplicated) throw new ConflictError(Messages.DUPLICATED_RESOURCE);
    }
}
