import ApiResponse from "../responses/ApiResponse.js";
import parseId from "../utils/parseId.js";
import { leerBusqueda, validateFiltroEstado } from "../utils/validateConsulta.js";

export default class PedidoController {
    constructor(pedidoService) {
        this.pedidoService = pedidoService;
    }

    getAll = (req, res) => {
        const filtros = {
            estado: validateFiltroEstado(req.query.estado),
            busqueda: leerBusqueda(req.query.busqueda)
        };
        return ApiResponse.success(res, this.pedidoService.getAll(req.usuario, filtros));
    };

    getById = (req, res) => {
        return ApiResponse.success(res, this.pedidoService.getById(req.usuario, parseId(req.params.id)));
    };

    create = (req, res) => {
        const resultado = this.pedidoService.create(req.usuario, req.body);
        res.location(`/api/pedidos/${resultado.pedido.idPedido}`);
        return ApiResponse.success(res, resultado, 201);
    };

    changeStatus = (req, res) => {
        return ApiResponse.success(res, this.pedidoService.changeStatus(req.usuario, parseId(req.params.id), req.body));
    };

    repeat = (req, res) => {
        return ApiResponse.success(res, this.pedidoService.repeat(req.usuario, parseId(req.params.id)));
    };
}
