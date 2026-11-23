import ApiResponse from "../responses/ApiResponse.js";

export default class ReporteController {
    constructor(reporteService) {
        this.reporteService = reporteService;
    }

    getVentas = (req, res) => {
        return ApiResponse.success(res, this.reporteService.getVentas(req.query));
    };

    getMasVendidos = (req, res) => {
        return ApiResponse.success(res, this.reporteService.getMasVendidos(req.query));
    };

    getCancelados = (req, res) => {
        return ApiResponse.success(res, this.reporteService.getCancelados(req.query));
    };

    getStockCritico = (req, res) => {
        return ApiResponse.success(res, this.reporteService.getStockCritico());
    };
}
