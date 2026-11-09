import AppError from "../exceptions/AppError.js";
import ApiResponse from "../responses/ApiResponse.js";
import { Messages } from "../enums/Messages.js";

export default function errorHandler(error, req, res, next) {
    if (res.headersSent) return next(error);
    if (error instanceof AppError) {
        return ApiResponse.error(res, error.message, error.statusCode);
    }
    if (error.type === "entity.parse.failed") {
        return ApiResponse.error(res, Messages.INVALID_JSON, 400);
    }
    if (error.type === "entity.too.large") {
        return ApiResponse.error(res, Messages.PAYLOAD_TOO_LARGE, 413);
    }
    if (["charset.unsupported", "encoding.unsupported"].includes(error.type)) {
        return ApiResponse.error(res, Messages.UNSUPPORTED_MEDIA_TYPE, 415);
    }
    if (error instanceof URIError || error.type === "request.size.invalid") {
        return ApiResponse.error(res, Messages.INVALID_DATA, 400);
    }
    console.error(error);
    return ApiResponse.error(res, Messages.INTERNAL_SERVER_ERROR, 500);
}
