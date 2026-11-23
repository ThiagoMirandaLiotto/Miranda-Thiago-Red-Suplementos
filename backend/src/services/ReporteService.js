import { EstadoPedido } from "../enums/EstadoPedido.js";
import { validateLimite, validatePeriodo } from "../utils/validateConsulta.js";
import { fechaLocal, sumarDias } from "../utils/fechas.js";
import { aCentavos, aPesos } from "../utils/dinero.js";

const { ENTREGADO, CANCELADO, VENCIDO } = EstadoPedido;

// F-08: reportes para decidir la reposición. Solo los ve el administrador (RN-10).
// Una venta es un pedido ENTREGADO: se paga al retirarlo en el local.
export default class ReporteService {
    constructor(pedidoRepository, productoRepository, pedidoService, reloj) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
        this.pedidoService = pedidoService;
        this.reloj = reloj;
    }

    getVentas(query) {
        const periodo = validatePeriodo(query, this.reloj.ahora());
        const entregados = this.#pedidosEn([ENTREGADO], "fechaEntrega", periodo);
        const porDia = new Map();
        for (let dia = periodo.inicio; dia < periodo.finExclusivo; dia = sumarDias(dia, 1)) {
            porDia.set(fechaLocal(dia), { fecha: fechaLocal(dia), total: 0, pedidos: 0 });
        }
        let total = 0;
        let descuentos = 0;
        let unidades = 0;
        for (const pedido of entregados) {
            const dia = porDia.get(fechaLocal(new Date(pedido.fechaEntrega)));
            dia.total += aCentavos(pedido.total);
            dia.pedidos += 1;
            total += aCentavos(pedido.total);
            descuentos += aCentavos(pedido.descuento);
            unidades += pedido.detalles.reduce((suma, detalle) => suma + detalle.cantidad, 0);
        }
        return {
            desde: periodo.desde,
            hasta: periodo.hasta,
            total: aPesos(total),
            pedidos: entregados.length,
            unidades,
            ticketPromedio: entregados.length ? aPesos(Math.round(total / entregados.length)) : 0,
            descuentos: aPesos(descuentos),
            porDia: [...porDia.values()].map((dia) => ({ ...dia, total: aPesos(dia.total) }))
        };
    }

    // Unidades entregadas por producto. "importe" es a precio de lista, antes del descuento de socios.
    getMasVendidos(query) {
        const periodo = validatePeriodo(query, this.reloj.ahora());
        const limite = validateLimite(query.limite);
        const porProducto = new Map();
        for (const pedido of this.#pedidosEn([ENTREGADO], "fechaEntrega", periodo)) {
            for (const detalle of pedido.detalles) {
                const actual = porProducto.get(detalle.idProducto) ?? { idProducto: detalle.idProducto, unidades: 0, importe: 0 };
                porProducto.set(detalle.idProducto, {
                    ...actual,
                    nombre: detalle.nombre,
                    marca: detalle.marca,
                    sabor: detalle.sabor,
                    unidades: actual.unidades + detalle.cantidad,
                    importe: actual.importe + aCentavos(detalle.subtotal)
                });
            }
        }
        const productos = [...porProducto.values()]
            .sort((a, b) => b.unidades - a.unidades || b.importe - a.importe)
            .slice(0, limite)
            .map((producto) => ({ ...producto, importe: aPesos(producto.importe) }));
        return { desde: periodo.desde, hasta: periodo.hasta, productos };
    }

    getCancelados(query) {
        const periodo = validatePeriodo(query, this.reloj.ahora());
        const cerrados = this.#pedidosEn([CANCELADO, VENCIDO], "fechaCierre", periodo)
            .sort((a, b) => new Date(b.fechaCierre) - new Date(a.fechaCierre));
        return {
            desde: periodo.desde,
            hasta: periodo.hasta,
            cancelados: cerrados.filter((pedido) => pedido.estado === CANCELADO).length,
            vencidos: cerrados.filter((pedido) => pedido.estado === VENCIDO).length,
            importe: aPesos(cerrados.reduce((suma, pedido) => suma + aCentavos(pedido.total), 0)),
            pedidos: cerrados.map((pedido) => ({
                idPedido: pedido.idPedido,
                codigo: pedido.codigo,
                estado: pedido.estado,
                cliente: pedido.cliente.nombre,
                total: pedido.total,
                motivo: pedido.motivoCancelacion,
                fecha: pedido.fechaCierre
            }))
        };
    }

    // Sin stock primero; después, los que están más lejos de su mínimo.
    getStockCritico() {
        const faltante = (producto) => producto.stock - producto.stockMinimo;
        return this.productoRepository.findAll()
            .filter((producto) => producto.activo && producto.requiereReposicion())
            .sort((a, b) => Number(a.stock !== 0) - Number(b.stock !== 0) || faltante(a) - faltante(b))
            .map(({ idProducto, nombre, marca, sabor, idCategoria, imagen, stock, stockMinimo }) =>
                ({ idProducto, nombre, marca, sabor, idCategoria, imagen, stock, stockMinimo }));
    }

    #pedidosEn(estados, campoFecha, periodo) {
        this.pedidoService.expireOverdue();
        return this.pedidoRepository.findAll().filter((pedido) => {
            if (!estados.includes(pedido.estado) || !pedido[campoFecha]) return false;
            const fecha = new Date(pedido[campoFecha]);
            return fecha >= periodo.inicio && fecha < periodo.finExclusivo;
        });
    }
}
