import Carrito from "../models/Carrito.js";

// Un carrito por usuario. Si todavía no armó ninguno, se devuelve uno vacío.
export default class CarritoRepository {
    #carritos = new Map();

    findByUsuario(idUsuario) {
        return new Carrito(this.#carritos.get(idUsuario) ?? { idUsuario });
    }

    save(carrito) {
        this.#carritos.set(carrito.idUsuario, new Carrito(carrito));
        return new Carrito(carrito);
    }

    delete(idUsuario) {
        this.#carritos.delete(idUsuario);
    }
}
