// Línea del pedido. Copia nombre, marca, sabor y precio del momento de la compra:
// si después cambia el producto, el historial y los reportes no se alteran.
export default class DetallePedido {
    constructor({ idDetalle, idPedido, idProducto, nombre, marca = "", sabor = "",
        cantidad, precioUnitario, subtotal }) {
        this.idDetalle = idDetalle;
        this.idPedido = idPedido;
        this.idProducto = idProducto;
        this.nombre = nombre;
        this.marca = marca;
        this.sabor = sabor;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.subtotal = subtotal;
    }
}
