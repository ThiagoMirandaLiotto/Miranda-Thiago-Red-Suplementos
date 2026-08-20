class Pedido {
    constructor(idPedido, codigo, idCliente, idAdminGestor, fechaCreacion, fechaRetiro, estado, total, motivoCancelacion) {
        this.idPedido = idPedido;
        this.codigo = codigo;
        this.idCliente = idCliente;
        this.idAdminGestor = idAdminGestor;
        this.fechaCreacion = fechaCreacion;
        this.fechaRetiro = fechaRetiro;
        this.estado = estado;
        this.total = total;
        this.motivoCancelacion = motivoCancelacion;
    }
}

export default Pedido;
