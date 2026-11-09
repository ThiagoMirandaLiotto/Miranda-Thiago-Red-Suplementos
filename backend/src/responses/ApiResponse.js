export default class ApiResponse {
    static success(res, data, statusCode = 200) {
        return res.status(statusCode).json({ success: true, data });
    }

    static error(res, message, statusCode) {
        return res.status(statusCode).json({ success: false, message });
    }
}
