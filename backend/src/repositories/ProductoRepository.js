import Producto from "../models/Producto.js";

export default class ProductoRepository {
    #productos = [];
    #nextId = 1;

    findAll() {
        return this.#productos.map((producto) => new Producto(producto));
    }

    findById(id) {
        const producto = this.#productos.find((item) => item.idProducto === id);
        return producto ? new Producto(producto) : null;
    }

    create(data) {
        const producto = new Producto({ ...data, idProducto: this.#nextId++ });
        this.#productos.push(producto);
        return new Producto(producto);
    }

    update(id, data) {
        const index = this.#productos.findIndex((item) => item.idProducto === id);
        if (index === -1) return null;
        this.#productos[index] = new Producto({ ...data, idProducto: id });
        return new Producto(this.#productos[index]);
    }
}
