// Cada cambio de stock de un producto (F-06, Anexo B). "cantidad" lleva signo:
// positiva cuando entra mercadería o vuelve por una cancelación, negativa cuando se vende o se descuenta.
export default class MovimientoStock {
    constructor({ idMovimiento, idProducto, tipo, cantidad, stockResultante, fecha,
        observacion = "", idUsuario = null, nombreUsuario = "Sistema", idPedido = null }) {
        this.idMovimiento = idMovimiento;
        this.idProducto = idProducto;
        this.tipo = tipo;
        this.cantidad = cantidad;
        this.stockResultante = stockResultante;
        this.fecha = fecha;
        this.observacion = observacion;
        this.idUsuario = idUsuario;
        this.nombreUsuario = nombreUsuario;
        this.idPedido = idPedido;
    }
}
