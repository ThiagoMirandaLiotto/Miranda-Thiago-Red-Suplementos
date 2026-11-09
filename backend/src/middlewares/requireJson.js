import { UnsupportedMediaTypeError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";

export default function requireJson(req, res, next) {
    if (!req.is("application/json")) {
        return next(new UnsupportedMediaTypeError(Messages.UNSUPPORTED_MEDIA_TYPE));
    }
    return next();
}
