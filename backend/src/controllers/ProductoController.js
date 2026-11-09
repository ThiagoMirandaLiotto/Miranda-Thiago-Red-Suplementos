import ApiResponse from "../responses/ApiResponse.js";
import parseId from "../utils/parseId.js";

export default class ProductoController {
    constructor(productoService) {
        this.productoService = productoService;
    }

    getAll = (req, res) => {
        return ApiResponse.success(res, this.productoService.getAll());
    };

    getById = (req, res) => {
        return ApiResponse.success(res, this.productoService.getById(parseId(req.params.id)));
    };

    create = (req, res) => {
        const producto = this.productoService.create(req.body);
        res.location(`/api/productos/${producto.idProducto}`);
        return ApiResponse.success(res, producto, 201);
    };

    update = (req, res) => {
        const producto = this.productoService.update(parseId(req.params.id), req.body);
        return ApiResponse.success(res, producto);
    };

    delete = (req, res) => {
        return ApiResponse.success(res, this.productoService.delete(parseId(req.params.id)));
    };
}
