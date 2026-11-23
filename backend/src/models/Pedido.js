import DetallePedido from "./DetallePedido.js";
import { ESTADOS_ACTIVOS } from "../enums/EstadoPedido.js";
import { Negocio } from "../enums/Negocio.js";
import { combinarFechaHora } from "../utils/fechas.js";

// Pedido para retirar en el local (F-04). Los datos del cliente se copian al crearlo:
// puede ser un cliente registrado (idCliente) o alguien que escribió por Instagram sin cuenta.
// "historial" registra quién cambió cada estado y cuándo (Anexo B: Administrador → Pedido gestionado).
export default class Pedido {
    constructor({ idPedido, codigo, idCliente = null, cliente, idAdminGestor = null, fechaCreacion,
        fechaRetiro, horaRetiro, estado, subtotal, porcentajeDescuento = 0, descuento = 0, total,
        motivoCancelacion = null, fechaEntrega = null, fechaCierre = null, detalles = [], historial = [] }) {
        this.idPedido = idPedido;
        this.codigo = codigo;
        this.idCliente = idCliente;
        this.cliente = { ...cliente };
        this.idAdminGestor = idAdminGestor;
        this.fechaCreacion = fechaCreacion;
        this.fechaRetiro = fechaRetiro;
        this.horaRetiro = horaRetiro;
        this.estado = estado;
        this.subtotal = subtotal;
        this.porcentajeDescuento = porcentajeDescuento;
        this.descuento = descuento;
        this.total = total;
        this.motivoCancelacion = motivoCancelacion;
        this.fechaEntrega = fechaEntrega;
        this.fechaCierre = fechaCierre;
        this.detalles = detalles.map((detalle) => new DetallePedido(detalle));
        this.historial = historial.map((cambio) => ({ ...cambio }));
    }

    static codigoPara(idPedido) {
        return `${Negocio.prefijoCodigo}-${String(idPedido).padStart(4, "0")}`;
    }

    estaActivo() {
        return ESTADOS_ACTIVOS.includes(this.estado);
    }

    // Fin de la franja acordada: "18:00" es de 18 a 19 h.
    finDelRetiro() {
        const hora = Number(this.horaRetiro.slice(0, 2));
        return combinarFechaHora(this.fechaRetiro, hora + 1);
    }

    // RN-06: 48 horas después del horario acordado, un pedido sin retirar vence.
    vencimiento() {
        return new Date(this.finDelRetiro().getTime() + Negocio.horasParaVencer * 3_600_000);
    }

    estaVencido(ahora) {
        return this.estaActivo() && ahora >= this.vencimiento();
    }
}
