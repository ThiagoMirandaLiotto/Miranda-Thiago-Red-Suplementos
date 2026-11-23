// Carrito del administrador mientras arma un pedido: productos y cantidades, sin precios.
// Los precios se leen al mostrarlo y se congelan en el pedido al confirmarlo.
export default class Carrito {
    constructor({ idUsuario, items = [] }) {
        this.idUsuario = idUsuario;
        this.items = items.map(({ idProducto, cantidad }) => ({ idProducto, cantidad }));
    }

    cantidadDe(idProducto) {
        return this.items.find((item) => item.idProducto === idProducto)?.cantidad ?? 0;
    }

    tiene(idProducto) {
        return this.items.some((item) => item.idProducto === idProducto);
    }

    fijarCantidad(idProducto, cantidad) {
        const item = this.items.find((actual) => actual.idProducto === idProducto);
        if (item) item.cantidad = cantidad;
        else this.items.push({ idProducto, cantidad });
    }

    quitar(idProducto) {
        this.items = this.items.filter((item) => item.idProducto !== idProducto);
    }

    estaVacio() {
        return this.items.length === 0;
    }
}
