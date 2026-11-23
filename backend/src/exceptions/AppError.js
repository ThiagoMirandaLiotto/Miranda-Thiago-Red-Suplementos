class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        Error.captureStackTrace?.(this, this.constructor);
    }
}

export class BadRequestError extends AppError {
    constructor(message) { super(message, 400); }
}

// Falta la sesión o venció.
export class UnauthorizedError extends AppError {
    constructor(message) { super(message, 401); }
}

// Hay sesión, pero el perfil no tiene permiso para la acción.
export class ForbiddenError extends AppError {
    constructor(message) { super(message, 403); }
}

export class NotFoundError extends AppError {
    constructor(message) { super(message, 404); }
}

export class ConflictError extends AppError {
    constructor(message) { super(message, 409); }
}

export class MethodNotAllowedError extends AppError {
    constructor(message) { super(message, 405); }
}

export class UnsupportedMediaTypeError extends AppError {
    constructor(message) { super(message, 415); }
}

export default AppError;
