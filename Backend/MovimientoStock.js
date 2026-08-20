class MovimientoStock {
    constructor(idMovimiento, idProducto, tipo, cantidad, fecha, observacion) {
        this.idMovimiento = idMovimiento;
        this.idProducto = idProducto;
        this.tipo = tipo;
        this.cantidad = cantidad;
        this.fecha = fecha;
        this.observacion = observacion;
    }
}

export default MovimientoStock;
