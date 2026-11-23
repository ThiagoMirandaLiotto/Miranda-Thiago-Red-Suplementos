import { UnauthorizedError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";

const BEARER = /^Bearer ([A-Za-z0-9_-]{20,200})$/;

// RN-02: exige una sesión vigente. Deja el usuario en req.usuario y el token en req.token.
export default function authenticate(authService) {
    return (req, res, next) => {
        const encabezado = req.get("Authorization");
        if (!encabezado) return next(new UnauthorizedError(Messages.UNAUTHORIZED));
        const token = BEARER.exec(encabezado)?.[1];
        const usuario = token ? authService.authenticate(token) : null;
        if (!usuario) return next(new UnauthorizedError(Messages.SESSION_EXPIRED));
        req.usuario = usuario;
        req.token = token;
        return next();
    };
}
