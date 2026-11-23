import { ForbiddenError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";

// RN-10: después de authenticate, deja pasar solo a los perfiles indicados.
export default function authorize(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.usuario?.rol)) return next(new ForbiddenError(Messages.FORBIDDEN));
        return next();
    };
}
