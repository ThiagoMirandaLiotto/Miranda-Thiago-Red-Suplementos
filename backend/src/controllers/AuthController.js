import ApiResponse from "../responses/ApiResponse.js";

export default class AuthController {
    constructor(authService) {
        this.authService = authService;
    }

    register = (req, res) => {
        return ApiResponse.success(res, this.authService.register(req.body), 201);
    };

    login = (req, res) => {
        return ApiResponse.success(res, this.authService.login(req.body));
    };

    logout = (req, res) => {
        return ApiResponse.success(res, this.authService.logout(req.token));
    };

    getSession = (req, res) => {
        return ApiResponse.success(res, req.usuario);
    };

    updateProfile = (req, res) => {
        return ApiResponse.success(res, this.authService.updateProfile(req.usuario, req.body));
    };
}
