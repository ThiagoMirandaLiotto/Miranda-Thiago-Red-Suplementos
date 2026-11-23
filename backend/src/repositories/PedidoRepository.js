import Pedido from "../models/Pedido.js";

export default class PedidoRepository {
    #pedidos = [];
    #nextId = 1;
    #nextDetalleId = 1;

    findAll() {
        return this.#pedidos.map((pedido) => new Pedido(pedido));
    }

    findById(id) {
        const pedido = this.#pedidos.find((item) => item.idPedido === id);
        return pedido ? new Pedido(pedido) : null;
    }

    // Asigna el ID, el código único (RED-0001) y los IDs de cada línea.
    create(data) {
        const idPedido = this.#nextId++;
        const detalles = data.detalles.map((detalle) => ({ ...detalle, idDetalle: this.#nextDetalleId++, idPedido }));
        const pedido = new Pedido({ ...data, idPedido, codigo: Pedido.codigoPara(idPedido), detalles });
        this.#pedidos.push(pedido);
        return new Pedido(pedido);
    }

    update(id, data) {
        const index = this.#pedidos.findIndex((item) => item.idPedido === id);
        if (index === -1) return null;
        const actual = this.#pedidos[index];
        this.#pedidos[index] = new Pedido({ ...data, idPedido: id, codigo: actual.codigo });
        return new Pedido(this.#pedidos[index]);
    }
}
