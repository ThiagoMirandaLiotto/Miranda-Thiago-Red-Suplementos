import ApiResponse from "../responses/ApiResponse.js";
import parseId from "../utils/parseId.js";
import { leerBusqueda } from "../utils/validateConsulta.js";

export default class ClienteController {
    constructor(clienteService) {
        this.clienteService = clienteService;
    }

    getAll = (req, res) => {
        return ApiResponse.success(res, this.clienteService.getAll({ busqueda: leerBusqueda(req.query.busqueda) }));
    };

    setMembership = (req, res) => {
        return ApiResponse.success(res, this.clienteService.setMembership(parseId(req.params.id), req.body));
    };
}
