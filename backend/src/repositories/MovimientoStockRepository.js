import MovimientoStock from "../models/MovimientoStock.js";

// Solo se agregan movimientos: el historial de stock no se edita ni se borra.
export default class MovimientoStockRepository {
    #movimientos = [];
    #nextId = 1;

    findAll() {
        return this.#movimientos.map((movimiento) => new MovimientoStock(movimiento));
    }

    findByProducto(idProducto) {
        return this.#movimientos
            .filter((movimiento) => movimiento.idProducto === idProducto)
            .map((movimiento) => new MovimientoStock(movimiento));
    }

    create(data) {
        const movimiento = new MovimientoStock({ ...data, idMovimiento: this.#nextId++ });
        this.#movimientos.push(movimiento);
        return new MovimientoStock(movimiento);
    }
}
