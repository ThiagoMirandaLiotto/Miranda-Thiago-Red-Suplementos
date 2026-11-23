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

    // req.usuario queda registrado en el movimiento de stock que generan el alta y las correcciones.
    create = (req, res) => {
        const producto = this.productoService.create(req.body, req.usuario);
        res.location(`/api/productos/${producto.idProducto}`);
        return ApiResponse.success(res, producto, 201);
    };

    update = (req, res) => {
        const producto = this.productoService.update(parseId(req.params.id), req.body, req.usuario);
        return ApiResponse.success(res, producto);
    };

    delete = (req, res) => {
        return ApiResponse.success(res, this.productoService.delete(parseId(req.params.id)));
    };
}
