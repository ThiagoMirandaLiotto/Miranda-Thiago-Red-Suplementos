import ApiResponse from "../responses/ApiResponse.js";
import parseId from "../utils/parseId.js";

// El carrito es del usuario de la sesión: nunca se elige por parámetro.
export default class CarritoController {
    constructor(carritoService) {
        this.carritoService = carritoService;
    }

    get = (req, res) => {
        const { idCliente } = req.query;
        const opciones = idCliente === undefined || idCliente === "" ? {} : { idCliente: parseId(idCliente) };
        return ApiResponse.success(res, this.carritoService.get(req.usuario.idUsuario, opciones));
    };

    addItem = (req, res) => {
        return ApiResponse.success(res, this.carritoService.addItem(req.usuario.idUsuario, req.body), 201);
    };

    updateItem = (req, res) => {
        const idProducto = parseId(req.params.idProducto);
        return ApiResponse.success(res, this.carritoService.updateItem(req.usuario.idUsuario, idProducto, req.body));
    };

    removeItem = (req, res) => {
        const idProducto = parseId(req.params.idProducto);
        return ApiResponse.success(res, this.carritoService.removeItem(req.usuario.idUsuario, idProducto));
    };

    clear = (req, res) => {
        return ApiResponse.success(res, this.carritoService.clear(req.usuario.idUsuario));
    };
}
