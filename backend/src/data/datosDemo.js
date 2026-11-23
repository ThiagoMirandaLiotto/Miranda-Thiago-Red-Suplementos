import { EstadoPedido } from "../enums/EstadoPedido.js";
import { TipoMovimiento } from "../enums/TipoMovimiento.js";
import { fechaLocal, inicioDelDia, sumarDias } from "../utils/fechas.js";

// Datos de demostración: precios, stock, clientes y pedidos son ficticios.
// Se cargan con los mismos servicios que usa la API, así cumplen todas las reglas de negocio:
// el stock baja con cada pedido, vuelve con las cancelaciones y cada cambio deja su movimiento.
// Las tres fotos de producto son recortes de una foto real del stock (docs/marca/fotos).

export const CONTRASENA_CLIENTES_DEMO = "Cliente2026";

const PRODUCTOS = [
    {
        clave: "trueMade", nombre: "True Made Whey Protein 930 g", marca: "ENA", idCategoria: 1, sabor: "Chocolate",
        precio: 38900, stock: 14, stockMinimo: 4, imagen: "/img/productos/ena-true-made-whey.webp",
        descripcion: "Proteína de suero de leche para la recuperación después de entrenar."
    },
    {
        clave: "platinum", nombre: "Platinum Whey Protein 908 g", marca: "Star Nutrition", idCategoria: 1, sabor: "Vainilla",
        precio: 41500, stock: 4, stockMinimo: 4, imagen: "/img/productos/star-platinum-whey.webp",
        descripcion: "Proteína de suero en polvo, fácil de mezclar con agua o leche."
    },
    {
        clave: "creatinaMono", nombre: "Creatina monohidrato 300 g", marca: "Star Nutrition", idCategoria: 2, sabor: "Sin sabor",
        precio: 25000.50, stock: 10, stockMinimo: 3, imagen: "",
        descripcion: "Creatina monohidrato en polvo, sin sabor, para sumar a cualquier bebida."
    },
    {
        clave: "creatinaMicro", nombre: "Creatina micronizada 250 g", marca: "ENA", idCategoria: 2, sabor: "Sin sabor",
        precio: 23900, stock: 0, stockMinimo: 2, imagen: "",
        descripcion: "Creatina micronizada de disolución rápida."
    },
    {
        clave: "preWar", nombre: "Pre War 300 g", marca: "ENA", idCategoria: 3, sabor: "Frutos rojos",
        precio: 27900, stock: 6, stockMinimo: 2, imagen: "",
        descripcion: "Pre-entreno en polvo para tomar antes de la rutina."
    },
    {
        clave: "pump", nombre: "Pump 3D Ripped 315 g", marca: "Star Nutrition", idCategoria: 3, sabor: "Limón",
        precio: 29500, stock: 4, stockMinimo: 2, imagen: "",
        descripcion: "Pre-entreno con sabor cítrico."
    },
    {
        clave: "bcaa", nombre: "BCAA 2:1:1 300 g", marca: "Star Nutrition", idCategoria: 4, sabor: "Limón",
        precio: 21900, stock: 8, stockMinimo: 3, imagen: "",
        descripcion: "Aminoácidos de cadena ramificada en polvo."
    },
    {
        clave: "glutamina", nombre: "Glutamina 300 g", marca: "Gentech", idCategoria: 4, sabor: "Sin sabor",
        precio: 19900, stock: 3, stockMinimo: 2, imagen: "",
        descripcion: "Glutamina en polvo, sin sabor."
    },
    {
        clave: "barraCaja", nombre: "Barra proteica caja x 12", marca: "Advance", idCategoria: 5, sabor: "Chocolate",
        precio: 26400, stock: 9, stockMinimo: 3, imagen: "/img/productos/advance-barra-proteica.webp",
        descripcion: "Caja de 12 barras proteicas para llevar al gimnasio."
    },
    {
        clave: "proteinBar", nombre: "Protein Bar", marca: "ENA", idCategoria: 5, sabor: "Cookies and cream",
        precio: 2400, stock: 18, stockMinimo: 10, imagen: "",
        descripcion: "Barra proteica individual."
    }
];

// Juan no es socio, Martina es socia verificada (10 %) y Sofía declaró ser socia, pero falta verificarla.
const CLIENTES = [
    { clave: "juan", nombre: "Juan", apellido: "Pérez", email: "cliente@example.com", telefono: "1100000101", esSocioGym: false },
    { clave: "martina", nombre: "Martina", apellido: "Gómez", email: "socia@example.com", telefono: "1100000102", esSocioGym: true, verificada: true },
    { clave: "sofia", nombre: "Sofía", apellido: "Ruiz", email: "nueva@example.com", telefono: "1100000103", esSocioGym: true }
];

const { LISTO_PARA_RETIRAR, ENTREGADO, CANCELADO } = EstadoPedido;

export function cargarDatosDemo(servicios, reloj, admin) {
    const { productoService, stockService, authService, clienteService, carritoService, pedidoService } = servicios;
    const hoy = inicioDelDia(reloj.ahora());
    const irA = (dias, hora, minutos = 0) => {
        const momento = sumarDias(hoy, dias);
        momento.setHours(hora, minutos, 0, 0);
        reloj.fijar(momento);
    };

    const productos = {};
    const clientes = {};
    const pedir = (cliente, items, diasRetiro, horaRetiro) => {
        for (const [clave, cantidad] of items) {
            carritoService.addItem(admin.idUsuario, { idProducto: productos[clave], cantidad });
        }
        const quien = typeof cliente === "string" ? { idCliente: clientes[cliente] } : { cliente };
        const datos = { ...quien, fechaRetiro: fechaLocal(sumarDias(hoy, diasRetiro)), horaRetiro };
        return pedidoService.create(admin, datos).pedido.idPedido;
    };
    const cambiar = (idPedido, estado, motivo) => {
        pedidoService.changeStatus(admin, idPedido, motivo ? { estado, motivo } : { estado });
    };

    try {
        // Catálogo cargado hace 20 días: el stock inicial queda como INGRESO.
        irA(-20, 9);
        for (const { clave, ...producto } of PRODUCTOS) {
            productos[clave] = productoService.create(producto, admin).idProducto;
        }
        for (const { clave, verificada, ...datos } of CLIENTES) {
            const cliente = authService.registerClient({
                ...datos, contrasena: CONTRASENA_CLIENTES_DEMO, confirmacion: CONTRASENA_CLIENTES_DEMO
            });
            if (verificada) clienteService.setMembership(cliente.idUsuario, { membresiaActiva: true });
            clientes[clave] = cliente.idUsuario;
        }

        // Pedidos de los últimos días, en orden cronológico.
        irA(-12, 10);
        const p1 = pedir("juan", [["platinum", 1], ["proteinBar", 2]], -12, "18:00");
        irA(-12, 12);
        cambiar(p1, LISTO_PARA_RETIRAR);
        irA(-12, 18, 20);
        cambiar(p1, ENTREGADO);

        irA(-10, 10);
        const p2 = pedir("martina", [["creatinaMono", 1]], -10, "19:00");
        irA(-10, 11);
        cambiar(p2, LISTO_PARA_RETIRAR);
        irA(-10, 19, 20);
        cambiar(p2, ENTREGADO);

        irA(-9, 10);
        const p3 = pedir({ nombre: "Nicolás", contacto: "@demo_nicolas" }, [["preWar", 1]], -9, "20:00");
        irA(-9, 15);
        cambiar(p3, CANCELADO, "Avisó por Instagram que no puede pasar a retirarlo.");

        irA(-8, 12);
        stockService.applyManualMovement(admin, productos.glutamina, {
            tipo: TipoMovimiento.AJUSTE, cantidad: -1, observacion: "Envase dañado en el depósito"
        });

        irA(-7, 10);
        const p4 = pedir("juan", [["bcaa", 1], ["glutamina", 1]], -6, "18:00");
        irA(-6, 11);
        cambiar(p4, LISTO_PARA_RETIRAR);
        irA(-6, 18, 20);
        cambiar(p4, ENTREGADO);

        irA(-6, 15);
        stockService.applyManualMovement(admin, productos.proteinBar, {
            tipo: TipoMovimiento.INGRESO, cantidad: 24, observacion: "Reposición del proveedor"
        });

        irA(-5, 10);
        const p5 = pedir("martina", [["barraCaja", 1]], -5, "19:00");
        irA(-5, 12);
        cambiar(p5, LISTO_PARA_RETIRAR);
        irA(-5, 19, 20);
        cambiar(p5, ENTREGADO);

        // Nadie lo retiró: vence 48 h después de la franja y su stock vuelve (RN-06).
        irA(-4, 10);
        const p6 = pedir({ nombre: "Camila", contacto: "@demo_camila" }, [["pump", 1]], -4, "19:00");
        irA(-4, 12);
        cambiar(p6, LISTO_PARA_RETIRAR);

        irA(-3, 10);
        const p7 = pedir({ nombre: "Lucas", contacto: "1100000104" }, [["trueMade", 1]], -2, "11:00");
        irA(-3, 16);
        cambiar(p7, LISTO_PARA_RETIRAR);
        irA(-2, 11, 20);
        cambiar(p7, ENTREGADO);

        irA(-1, 10);
        const p8 = pedir("juan", [["proteinBar", 3]], -1, "18:00");
        irA(-1, 12);
        cambiar(p8, LISTO_PARA_RETIRAR);
        irA(-1, 18, 20);
        cambiar(p8, ENTREGADO);
    } finally {
        reloj.liberar();
    }

    // Pedidos en curso, con la hora real: uno listo para retirar mañana y dos pendientes.
    const p9 = pedir("martina", [["trueMade", 1]], 1, "10:00");
    cambiar(p9, LISTO_PARA_RETIRAR);
    pedir("juan", [["creatinaMono", 1], ["proteinBar", 2]], 1, "18:00");
    pedir({ nombre: "Valentina", contacto: "@demo_valentina" }, [["bcaa", 2]], 2, "19:00");

    return { productos: PRODUCTOS.length, clientes: CLIENTES.length, pedidos: 11 };
}
