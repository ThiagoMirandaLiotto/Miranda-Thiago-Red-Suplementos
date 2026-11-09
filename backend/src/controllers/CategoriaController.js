import ApiResponse from "../responses/ApiResponse.js";

export default class CategoriaController {
    constructor(categoriaService) {
        this.categoriaService = categoriaService;
    }

    getAll = (req, res) => {
        return ApiResponse.success(res, this.categoriaService.getAll());
    };
}
