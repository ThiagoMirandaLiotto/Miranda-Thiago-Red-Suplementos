class DetallePedido {
    constructor(idDetalle, idPedido, idProducto, cantidad, precioUnitario, subtotal) {
        this.idDetalle = idDetalle;
        this.idPedido = idPedido;
        this.idProducto = idProducto;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.subtotal = subtotal;
    }
}

export default DetallePedido;
