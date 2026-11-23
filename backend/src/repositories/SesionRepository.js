import Sesion from "../models/Sesion.js";

export default class SesionRepository {
    #sesiones = new Map();

    findByToken(token) {
        const sesion = this.#sesiones.get(token);
        return sesion ? new Sesion(sesion) : null;
    }

    create(data) {
        const sesion = new Sesion(data);
        this.#sesiones.set(sesion.token, sesion);
        return new Sesion(sesion);
    }

    delete(token) {
        return this.#sesiones.delete(token);
    }
}
