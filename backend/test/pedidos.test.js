import test from "node:test";
import assert from "node:assert/strict";
import { Messages } from "../src/enums/Messages.js";
import { crearEntorno } from "./helpers.js";

// Las pruebas corren el martes 24/11/2026 a las 10:00 (ver helpers.js).

test("F-04 y F-06: confirmar registra el pedido con código, descuenta el stock y vacía el carrito", async (t) => {
    const { pedir, agregar, confirmar, crearProducto } = await crearEntorno(t);
    await crearProducto({ precio: 25000.50, stock: 10 });
    await crearProducto({ nombre: "Barra", idCategoria: 5, precio: 2400, stock: 40 });
    await agregar(1, 2);
    await agregar(2, 5);

    const { status, body, headers } = await confirmar();
    assert.equal(status, 201);
    assert.equal(headers.get("location"), "/api/pedidos/1");
    const { pedido, alertasStock } = body.data;
    assert.equal(pedido.codigo, "RED-0001");
    assert.equal(pedido.estado, "PENDIENTE");
    assert.equal(pedido.idCliente, null);
    assert.deepEqual(pedido.cliente, { nombre: "Ana", contacto: "@ana.prueba" });
    assert.equal(pedido.fechaRetiro, "2026-11-25");
    assert.equal(pedido.horaRetiro, "18:00");
    assert.equal(pedido.subtotal, 62001);
    assert.equal(pedido.descuento, 0);
    assert.equal(pedido.total, 62001);
    assert.deepEqual(pedido.detalles.map((d) => [d.idProducto, d.cantidad, d.precioUnitario, d.subtotal]),
        [[1, 2, 25000.5, 50001], [2, 5, 2400, 12000]]);
    assert.equal(pedido.historial[0].estado, "PENDIENTE");
    assert.equal(pedido.historial[0].nombreUsuario, "Admin Prueba");
    assert.deepEqual(alertasStock, []);

    assert.equal((await pedir("GET", "/api/productos/1")).body.data.stock, 8);
    assert.equal((await pedir("GET", "/api/productos/2")).body.data.stock, 35);
    const [venta] = (await pedir("GET", "/api/productos/1/movimientos")).body.data;
    assert.deepEqual([venta.tipo, venta.cantidad, venta.stockResultante, venta.idPedido, venta.observacion],
        ["VENTA", -2, 8, 1, "Pedido RED-0001"]);
    assert.deepEqual((await pedir("GET", "/api/carrito")).body.data.items, []);

    await agregar(2, 1);
    assert.equal((await confirmar()).body.data.pedido.codigo, "RED-0002");
});

test("V-08: no se confirma un carrito vacío", async (t) => {
    const { confirmar } = await crearEntorno(t);
    const { status, body } = await confirmar();
    assert.equal(status, 400);
    assert.equal(body.message, Messages.EMPTY_CART);
});

for (const [etiqueta, retiro, mensaje] of [
    ["fecha pasada", { fechaRetiro: "2026-11-23" }, Messages.PAST_PICKUP_DATE],
    ["fecha inexistente", { fechaRetiro: "2026-02-30" }, Messages.INVALID_PICKUP_DATE],
    ["fecha con otro formato", { fechaRetiro: "25/11/2026" }, Messages.INVALID_PICKUP_DATE],
    ["más de 30 días", { fechaRetiro: "2026-12-25" }, Messages.PICKUP_TOO_FAR],
    ["antes de abrir", { horaRetiro: "06:00" }, Messages.INVALID_PICKUP_TIME],
    ["después de cerrar", { horaRetiro: "22:00" }, Messages.INVALID_PICKUP_TIME],
    ["hora que no inicia una franja", { horaRetiro: "18:30" }, Messages.INVALID_PICKUP_TIME],
    ["hora como número", { horaRetiro: 18 }, Messages.INVALID_PICKUP_TIME],
    ["franja de hoy terminada", { fechaRetiro: "2026-11-24", horaRetiro: "09:00" }, Messages.PICKUP_TIME_PASSED]
]) {
    test(`RN-03 y V-06: retiro con ${etiqueta} se rechaza sin tocar stock ni carrito`, async (t) => {
        const { pedir, agregar, confirmar, crearProducto } = await crearEntorno(t);
        await crearProducto({ stock: 5 });
        await agregar(1, 2);
        const { status, body } = await confirmar(retiro);
        assert.equal(status, 400);
        assert.equal(body.message, mensaje);
        assert.equal((await pedir("GET", "/api/productos/1")).body.data.stock, 5);
        assert.equal((await pedir("GET", "/api/carrito")).body.data.items[0].cantidad, 2);
        assert.deepEqual((await pedir("GET", "/api/pedidos")).body.data, []);
    });
}

test("RN-03: se acepta la franja en curso de hoy y el día 30", async (t) => {
    const { agregar, confirmar, crearProducto } = await crearEntorno(t);
    await crearProducto();
    await agregar(1, 1);
    assert.equal((await confirmar({ fechaRetiro: "2026-11-24", horaRetiro: "10:00" })).status, 201);
    await agregar(1, 1);
    assert.equal((await confirmar({ fechaRetiro: "2026-12-24", horaRetiro: "21:00" })).status, 201);
});

test("Cliente del pedido: registrado o sin cuenta, nunca los dos ni ninguno", async (t) => {
    const { agregar, confirmar, crearProducto, registrarCliente } = await crearEntorno(t);
    await crearProducto({ stock: 20 });
    await agregar(1, 1);
    const cliente = await registrarCliente({ nombre: "Juan", apellido: "Pérez", email: "juan@prueba.com" });
    for (const [cuerpo, mensaje] of [
        [{ idCliente: cliente.usuario.idUsuario }, Messages.INVALID_CLIENT_REF],
        [{ cliente: undefined }, Messages.INVALID_CLIENT_REF],
        [{ cliente: "Ana" }, Messages.INVALID_CLIENT_REF],
        [{ idCliente: 99, cliente: undefined }, Messages.CLIENT_NOT_FOUND],
        [{ idCliente: 1, cliente: undefined }, Messages.CLIENT_NOT_FOUND],
        [{ idCliente: "2", cliente: undefined }, Messages.INVALID_CLIENT_ID],
        [{ cliente: { nombre: "", contacto: "@ana" } }, Messages.INVALID_GUEST_NAME],
        [{ cliente: { nombre: "Ana" } }, Messages.INVALID_GUEST_CONTACT],
        [{ cliente: { nombre: "Ana", contacto: "ana perez" } }, Messages.INVALID_GUEST_CONTACT],
        [{ cliente: { nombre: "Ana", contacto: "@ana", email: "x@y.com" } }, Messages.FIELDS_NOT_ALLOWED]
    ]) {
        const resultado = await confirmar(cuerpo);
        assert.equal(resultado.body.message, mensaje, JSON.stringify(cuerpo));
        assert.ok([400, 404].includes(resultado.status));
    }
    const registrado = await confirmar({ idCliente: cliente.usuario.idUsuario, cliente: undefined });
    assert.equal(registrado.status, 201);
    assert.deepEqual(registrado.body.data.pedido.cliente, { nombre: "Juan Pérez", contacto: "juan@prueba.com", telefono: "1100000000" });
    await agregar(1, 1);
    const porTelefono = await confirmar({ cliente: { nombre: "  Ana   María ", contacto: "1123456789" } });
    assert.deepEqual(porTelefono.body.data.pedido.cliente, { nombre: "Ana María", contacto: "1123456789" });
    await agregar(1, 1);
    const porInstagram = await confirmar({ cliente: { nombre: "Ana", contacto: "@Ana.Perez_" } });
    assert.equal(porInstagram.body.data.pedido.cliente.contacto, "@ana.perez_");
});

test("RN-01: si el stock cambió desde que se armó el carrito, no se confirma nada", async (t) => {
    const { pedir, agregar, confirmar, crearProducto } = await crearEntorno(t);
    await crearProducto({ stock: 5 });
    await crearProducto({ nombre: "Barra", idCategoria: 5, stock: 10 });
    await agregar(1, 5);
    await agregar(2, 1);
    await pedir("POST", "/api/productos/1/movimientos", { body: { tipo: "AJUSTE", cantidad: -2, observacion: "Rotura" } });
    const vista = await pedir("GET", "/api/carrito");
    assert.equal(vista.body.data.items[0].problema, Messages.INSUFFICIENT_STOCK("Creatina monohidrato 300 g", 3));
    const fallido = await confirmar();
    assert.equal(fallido.status, 409);
    assert.equal(fallido.body.message, Messages.INSUFFICIENT_STOCK("Creatina monohidrato 300 g", 3));
    assert.equal((await pedir("GET", "/api/productos/2")).body.data.stock, 10);
    assert.deepEqual((await pedir("GET", "/api/pedidos")).body.data, []);

    await pedir("PATCH", "/api/carrito/items/1", { body: { cantidad: 3 } });
    await pedir("DELETE", "/api/productos/2");
    const sinVenta = await confirmar();
    assert.equal(sinVenta.status, 409);
    assert.equal(sinVenta.body.message, Messages.PRODUCT_UNAVAILABLE("Barra"));
});

test("RN-09: el 10 % se aplica solo al socio con la membresía verificada", async (t) => {
    const { pedir, agregar, confirmar, crearProducto, registrarCliente } = await crearEntorno(t);
    await crearProducto({ precio: 25000.50, stock: 10 });
    const socio = await registrarCliente({ esSocioGym: true });
    await agregar(1, 1);
    const sinVerificar = await confirmar({ idCliente: socio.usuario.idUsuario, cliente: undefined });
    assert.equal(sinVerificar.body.data.pedido.descuento, 0);
    await pedir("PATCH", `/api/clientes/${socio.usuario.idUsuario}/membresia`, { body: { membresiaActiva: true } });
    await agregar(1, 1);
    const { pedido } = (await confirmar({ idCliente: socio.usuario.idUsuario, cliente: undefined })).body.data;
    assert.equal(pedido.porcentajeDescuento, 10);
    assert.equal(pedido.subtotal, 25000.5);
    assert.equal(pedido.descuento, 2500.05);
    assert.equal(pedido.total, 22500.45);
    await agregar(1, 1);
    const invitado = await confirmar();
    assert.equal(invitado.body.data.pedido.descuento, 0);
});

test("F-05: pendiente → listo para retirar → entregado, con el historial de quién y cuándo", async (t) => {
    const { pedir, agregar, confirmar, crearProducto, reloj, renovarSesion } = await crearEntorno(t);
    await crearProducto({ stock: 5 });
    await agregar(1, 2);
    await confirmar();
    const cambiar = (body) => pedir("PATCH", "/api/pedidos/1/estado", { body });

    const directo = await cambiar({ estado: "ENTREGADO" });
    assert.equal(directo.status, 409);
    assert.equal(directo.body.message, Messages.MUST_BE_READY_FIRST);
    reloj.avanzarHoras(1);
    const listo = await cambiar({ estado: "LISTO_PARA_RETIRAR" });
    assert.equal(listo.status, 200);
    assert.equal(listo.body.data.estado, "LISTO_PARA_RETIRAR");
    assert.equal((await cambiar({ estado: "LISTO_PARA_RETIRAR" })).body.message, Messages.SAME_STATUS("listo para retirar"));
    reloj.avanzarHoras(31);
    await renovarSesion();
    const entregado = await cambiar({ estado: "ENTREGADO" });
    assert.equal(entregado.body.data.estado, "ENTREGADO");
    assert.equal(entregado.body.data.fechaEntrega, new Date(2026, 10, 25, 18).toISOString());
    assert.deepEqual(entregado.body.data.historial.map((cambio) => cambio.estado), ["PENDIENTE", "LISTO_PARA_RETIRAR", "ENTREGADO"]);
    assert.equal(entregado.body.data.historial[2].nombreUsuario, "Admin Prueba");

    const cerrado = await cambiar({ estado: "CANCELADO", motivo: "Ya no lo quiere" });
    assert.equal(cerrado.status, 409);
    assert.equal(cerrado.body.message, Messages.ORDER_CLOSED("entregado"));
    assert.equal((await cambiar({ estado: "VENCIDO" })).body.message, Messages.INVALID_STATUS);
    assert.equal((await cambiar({ estado: "PENDIENTE" })).status, 400);
    assert.equal((await pedir("GET", "/api/productos/1")).body.data.stock, 3);
});

test("RN-05: el administrador cancela con motivo y el stock vuelve con un movimiento de DEVOLUCIÓN", async (t) => {
    const { pedir, agregar, confirmar, crearProducto } = await crearEntorno(t);
    await crearProducto({ stock: 5 });
    await agregar(1, 3);
    await confirmar();
    await pedir("PATCH", "/api/pedidos/1/estado", { body: { estado: "LISTO_PARA_RETIRAR" } });
    for (const motivo of [undefined, "", "  no  "]) {
        const sinMotivo = await pedir("PATCH", "/api/pedidos/1/estado", { body: { estado: "CANCELADO", motivo } });
        assert.equal(sinMotivo.status, 400);
        assert.equal(sinMotivo.body.message, Messages.CANCEL_REASON_REQUIRED);
    }
    const largo = await pedir("PATCH", "/api/pedidos/1/estado", { body: { estado: "CANCELADO", motivo: "x".repeat(301) } });
    assert.equal(largo.body.message, Messages.INVALID_REASON);
    const cancelado = await pedir("PATCH", "/api/pedidos/1/estado", { body: { estado: "CANCELADO", motivo: "Faltó stock del proveedor" } });
    assert.equal(cancelado.status, 200);
    assert.equal(cancelado.body.data.motivoCancelacion, "Faltó stock del proveedor");
    assert.equal((await pedir("GET", "/api/productos/1")).body.data.stock, 5);
    const [devolucion] = (await pedir("GET", "/api/productos/1/movimientos")).body.data;
    assert.deepEqual([devolucion.tipo, devolucion.cantidad, devolucion.stockResultante], ["DEVOLUCION", 3, 5]);
});

test("RN-04: el cliente ve solo sus pedidos y cancela únicamente mientras están pendientes", async (t) => {
    const { pedir, agregar, confirmar, crearProducto, registrarCliente } = await crearEntorno(t);
    await crearProducto({ stock: 10 });
    const juan = await registrarCliente();
    const otro = await registrarCliente();
    const pedidoDeJuan = { idCliente: juan.usuario.idUsuario, cliente: undefined };
    await agregar(1, 2);
    await confirmar(pedidoDeJuan);
    await agregar(1, 1);
    await confirmar(pedidoDeJuan);
    await agregar(1, 1);
    await confirmar();

    assert.deepEqual((await pedir("GET", "/api/pedidos", { token: juan.token })).body.data.map((p) => p.codigo), ["RED-0002", "RED-0001"]);
    assert.deepEqual((await pedir("GET", "/api/pedidos", { token: otro.token })).body.data, []);
    assert.equal((await pedir("GET", "/api/pedidos/1", { token: otro.token })).status, 404);
    assert.equal((await pedir("GET", "/api/pedidos/3", { token: juan.token })).status, 404);
    const ajeno = await pedir("PATCH", "/api/pedidos/1/estado", { body: { estado: "CANCELADO" }, token: otro.token });
    assert.equal(ajeno.status, 404);

    const soloCancelar = await pedir("PATCH", "/api/pedidos/1/estado", { body: { estado: "LISTO_PARA_RETIRAR" }, token: juan.token });
    assert.equal(soloCancelar.status, 403);
    assert.equal(soloCancelar.body.message, Messages.CLIENT_ONLY_CANCEL);
    const cancelado = await pedir("PATCH", "/api/pedidos/1/estado", { body: { estado: "CANCELADO" }, token: juan.token });
    assert.equal(cancelado.status, 200);
    assert.equal(cancelado.body.data.motivoCancelacion, "Lo canceló el cliente desde su cuenta.");
    assert.equal(cancelado.body.data.historial[1].rol, "CLIENTE");
    assert.equal((await pedir("GET", "/api/productos/1")).body.data.stock, 8);

    await pedir("PATCH", "/api/pedidos/2/estado", { body: { estado: "LISTO_PARA_RETIRAR" } });
    const tarde = await pedir("PATCH", "/api/pedidos/2/estado", { body: { estado: "CANCELADO" }, token: juan.token });
    assert.equal(tarde.status, 409);
    assert.equal(tarde.body.message, Messages.CLIENT_CANCEL_ONLY_PENDING);
    assert.equal((await pedir("POST", "/api/pedidos", { body: {}, token: juan.token })).status, 403);
});

test("RN-06: 48 horas después de la franja sin retirar, el pedido vence y libera el stock", async (t) => {
    const { pedir, agregar, confirmar, crearProducto, reloj, renovarSesion } = await crearEntorno(t);
    await crearProducto({ stock: 5 });
    await agregar(1, 2);
    await confirmar({ fechaRetiro: "2026-11-25", horaRetiro: "18:00" });
    await agregar(1, 1);
    await confirmar({ fechaRetiro: "2026-11-25", horaRetiro: "18:00" });
    await pedir("PATCH", "/api/pedidos/1/estado", { body: { estado: "LISTO_PARA_RETIRAR" } });
    reloj.fijar(new Date(2026, 10, 25, 18, 30));
    await renovarSesion();
    await pedir("PATCH", "/api/pedidos/2/estado", { body: { estado: "LISTO_PARA_RETIRAR" } });
    await pedir("PATCH", "/api/pedidos/2/estado", { body: { estado: "ENTREGADO" } });

    reloj.fijar(new Date(2026, 10, 27, 18, 59));
    await renovarSesion();
    assert.equal((await pedir("GET", "/api/pedidos/1")).body.data.estado, "LISTO_PARA_RETIRAR");
    reloj.fijar(new Date(2026, 10, 27, 19, 0));
    const vencido = (await pedir("GET", "/api/pedidos/1")).body.data;
    assert.equal(vencido.estado, "VENCIDO");
    assert.equal(vencido.fechaCierre, new Date(2026, 10, 27, 19).toISOString());
    assert.equal(vencido.historial.at(-1).nombreUsuario, "Sistema");
    assert.equal((await pedir("GET", "/api/pedidos/2")).body.data.estado, "ENTREGADO");
    assert.equal((await pedir("GET", "/api/productos/1")).body.data.stock, 4);
    const [devolucion] = (await pedir("GET", "/api/productos/1/movimientos")).body.data;
    assert.deepEqual([devolucion.tipo, devolucion.observacion], ["DEVOLUCION", "Pedido RED-0001 vencido"]);
    const cerrado = await pedir("PATCH", "/api/pedidos/1/estado", { body: { estado: "ENTREGADO" } });
    assert.equal(cerrado.body.message, Messages.ORDER_CLOSED("vencido"));
});

test("F-07: repetir carga los productos en el carrito según el stock de hoy", async (t) => {
    const { pedir, agregar, confirmar, crearProducto, registrarCliente } = await crearEntorno(t);
    await crearProducto({ stock: 10 });
    await crearProducto({ nombre: "Barra", idCategoria: 5, precio: 2400, stock: 6 });
    await crearProducto({ nombre: "Glutamina", idCategoria: 4, stock: 3 });
    const juan = await registrarCliente();
    await agregar(1, 2);
    await agregar(2, 4);
    await agregar(3, 1);
    await confirmar({ idCliente: juan.usuario.idUsuario, cliente: undefined });
    await pedir("POST", "/api/productos/2/movimientos", { body: { tipo: "AJUSTE", cantidad: -1, observacion: "Vencidas" } });
    await pedir("DELETE", "/api/productos/3");

    const repetido = await pedir("POST", "/api/pedidos/1/repetir");
    assert.equal(repetido.status, 200);
    const { carrito, avisos, idCliente } = repetido.body.data;
    assert.equal(idCliente, juan.usuario.idUsuario);
    assert.deepEqual(carrito.items.map((item) => [item.idProducto, item.cantidad]), [[1, 2], [2, 1]]);
    assert.deepEqual(avisos, ["De «Barra» había 1 unidad en stock: se agregó esa cantidad.", "«Glutamina» ya no está a la venta."]);
    assert.equal((await pedir("POST", "/api/pedidos/1/repetir", { token: juan.token })).status, 403);

    await pedir("DELETE", "/api/carrito");
    await pedir("POST", "/api/productos/2/movimientos", { body: { tipo: "AJUSTE", cantidad: -1, observacion: "Vencidas" } });
    await pedir("POST", "/api/productos/1/movimientos", { body: { tipo: "AJUSTE", cantidad: -8, observacion: "Inventario" } });
    const nada = await pedir("POST", "/api/pedidos/1/repetir");
    assert.equal(nada.status, 409);
    assert.equal(nada.body.message, Messages.NOTHING_TO_REPEAT);
});

test("F-06: al confirmar, avisa qué productos quedaron sin stock o debajo del mínimo", async (t) => {
    const { agregar, confirmar, crearProducto } = await crearEntorno(t);
    await crearProducto({ stock: 4, stockMinimo: 3 });
    await crearProducto({ nombre: "Barra", idCategoria: 5, stock: 1, stockMinimo: 0 });
    await agregar(1, 2);
    await agregar(2, 1);
    const { alertasStock } = (await confirmar()).body.data;
    assert.deepEqual(alertasStock, [
        { idProducto: 1, nombre: "Creatina monohidrato 300 g", stock: 2, stockMinimo: 3 },
        { idProducto: 2, nombre: "Barra", stock: 0, stockMinimo: 0 }
    ]);
});

test("Listado: filtros por estado y búsqueda; pedidos inexistentes e IDs inválidos", async (t) => {
    const { pedir, agregar, confirmar, crearProducto } = await crearEntorno(t);
    await crearProducto({ stock: 10 });
    await agregar(1, 1);
    await confirmar();
    await agregar(1, 1);
    await confirmar({ cliente: { nombre: "Bruno", contacto: "@bruno" } });
    await pedir("PATCH", "/api/pedidos/2/estado", { body: { estado: "LISTO_PARA_RETIRAR" } });
    assert.deepEqual((await pedir("GET", "/api/pedidos?estado=PENDIENTE")).body.data.map((p) => p.idPedido), [1]);
    assert.deepEqual((await pedir("GET", "/api/pedidos?busqueda=brun")).body.data.map((p) => p.idPedido), [2]);
    assert.deepEqual((await pedir("GET", "/api/pedidos?busqueda=red-0001")).body.data.map((p) => p.idPedido), [1]);
    assert.equal((await pedir("GET", "/api/pedidos?estado=ACTIVO")).body.message, Messages.INVALID_STATUS_FILTER);
    assert.equal((await pedir("GET", "/api/pedidos/99")).body.message, Messages.ORDER_NOT_FOUND);
    assert.equal((await pedir("GET", "/api/pedidos/abc")).status, 400);
    assert.equal((await pedir("GET", "/api/pedidos", { token: null })).status, 401);
});
