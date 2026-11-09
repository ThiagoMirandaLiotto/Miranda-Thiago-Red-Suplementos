import { ConflictError, NotFoundError, BadRequestError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import validateProducto from "../utils/validateProducto.js";
import normalizeText from "../utils/normalizeText.js";

export default class ProductoService {
    constructor(productoRepository, categoriaRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
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

    create(data) {
        const validData = validateProducto(data);
        this.validateBusinessRules(validData);
        return this.productoRepository.create(validData);
    }

    update(id, data) {
        this.getById(id);
        const validData = validateProducto(data);
        this.validateBusinessRules(validData, id);
        return this.productoRepository.update(id, { ...validData, activo: true });
    }

    delete(id) {
        const producto = this.getById(id);
        // Baja lógica: el registro sigue disponible para relaciones históricas.
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
