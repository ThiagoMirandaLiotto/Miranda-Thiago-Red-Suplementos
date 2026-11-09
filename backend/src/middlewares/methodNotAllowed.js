import { MethodNotAllowedError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";

export default function methodNotAllowed(methods) {
    return (req, res, next) => {
        res.set("Allow", methods);
        next(new MethodNotAllowedError(Messages.METHOD_NOT_ALLOWED));
    };
}
