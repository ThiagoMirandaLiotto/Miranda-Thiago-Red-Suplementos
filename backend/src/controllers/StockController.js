import ApiResponse from "../responses/ApiResponse.js";
import parseId from "../utils/parseId.js";

// Movimientos de stock de un producto: /api/productos/:id/movimientos
export default class StockController {
    constructor(stockService) {
        this.stockService = stockService;
    }

    getMovements = (req, res) => {
        return ApiResponse.success(res, this.stockService.getMovements(parseId(req.params.id)));
    };

    createMovement = (req, res) => {
        const resultado = this.stockService.applyManualMovement(req.usuario, parseId(req.params.id), req.body);
        return ApiResponse.success(res, resultado, 201);
    };
}
