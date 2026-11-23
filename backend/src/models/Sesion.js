// Sesión abierta con un token aleatorio. El cliente lo envía como "Authorization: Bearer <token>".
export default class Sesion {
    constructor({ token, idUsuario, creada, expira }) {
        this.token = token;
        this.idUsuario = idUsuario;
        this.creada = creada;
        this.expira = expira;
    }

    vencida(ahora) {
        return new Date(this.expira) <= ahora;
    }
}
