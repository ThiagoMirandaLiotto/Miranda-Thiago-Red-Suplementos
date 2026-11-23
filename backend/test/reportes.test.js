import test from "node:test";
import assert from "node:assert/strict";
import { Messages } from "../src/enums/Messages.js";
import { crearEntorno } from "./helpers.js";

// Arma tres pedidos: uno entregado hoy, uno cancelado y uno que vence.
async function conVentas(t) {
    const entorno = await crearEntorno(t);
    const { pedir, agregar, confirmar, crearProducto, reloj, renovarSesion } = entorno;
    await crearProducto({ precio: 1000, stock: 20, stockMinimo: 5 });
    await crearProducto({ nombre: "Barra", idCategoria: 5, precio: 250.5, stock: 3, stockMinimo: 4 });
    await crearProducto({ nombre: "Pre War", idCategoria: 3, precio: 5000, stock: 0, stockMinimo: 0 });
    const cambiar = (id, body) => pedir("PATCH", `/api/pedidos/${id}/estado`, { body });

    await agregar(1, 3);
    await agregar(2, 2);
    await confirmar({ fechaRetiro: "2026-11-24", horaRetiro: "18:00" });
    await cambiar(1, { estado: "LISTO_PARA_RETIRAR" });
    reloj.fijar(new Date(2026, 10, 24, 18, 15));
    await renovarSesion();
    await cambiar(1, { estado: "ENTREGADO" });

    await agregar(1, 1);
    await confirmar({ fechaRetiro: "2026-11-25", horaRetiro: "10:00" });
    await cambiar(2, { estado: "CANCELADO", motivo: "No lo pudo pasar a buscar" });

    await agregar(1, 2);
    await confirmar({ fechaRetiro: "2026-11-25", horaRetiro: "10:00" });
    reloj.fijar(new Date(2026, 10, 28, 9, 0));
    await renovarSesion();
    return entorno;
}

test("F-08: ventas por período con total, ticket promedio y detalle por día", async (t) => {
    const { pedir } = await conVentas(t);
    const { status, body } = await pedir("GET", "/api/reportes/ventas?desde=2026-11-22&hasta=2026-11-28");
    assert.equal(status, 200);
    const ventas = body.data;
    assert.equal(ventas.total, 3501);
    assert.equal(ventas.pedidos, 1);
    assert.equal(ventas.unidades, 5);
    assert.equal(ventas.ticketPromedio, 3501);
    assert.equal(ventas.porDia.length, 7);
    assert.deepEqual(ventas.porDia.find((dia) => dia.fecha === "2026-11-24"), { fecha: "2026-11-24", total: 3501, pedidos: 1 });
    const fuera = (await pedir("GET", "/api/reportes/ventas?desde=2026-11-25&hasta=2026-11-28")).body.data;
    assert.equal(fuera.total, 0);
    const porDefecto = (await pedir("GET", "/api/reportes/ventas")).body.data;
    assert.deepEqual([porDefecto.desde, porDefecto.hasta, porDefecto.porDia.length], ["2026-10-30", "2026-11-28", 30]);
});

test("F-08: más vendidos, cancelados y vencidos, y stock crítico", async (t) => {
    const { pedir } = await conVentas(t);
    const masVendidos = (await pedir("GET", "/api/reportes/mas-vendidos?desde=2026-11-01&hasta=2026-11-30")).body.data;
    assert.deepEqual(masVendidos.productos.map((p) => [p.nombre, p.unidades, p.importe]),
        [["Creatina monohidrato 300 g", 3, 3000], ["Barra", 2, 501]]);
    assert.equal((await pedir("GET", "/api/reportes/mas-vendidos?limite=1")).body.data.productos.length, 1);

    const cerrados = (await pedir("GET", "/api/reportes/cancelados?desde=2026-11-01&hasta=2026-11-30")).body.data;
    assert.equal(cerrados.cancelados, 1);
    assert.equal(cerrados.vencidos, 1);
    assert.equal(cerrados.importe, 3000);
    assert.deepEqual(cerrados.pedidos.map((p) => [p.codigo, p.estado]), [["RED-0003", "VENCIDO"], ["RED-0002", "CANCELADO"]]);
    assert.equal(cerrados.pedidos[1].motivo, "No lo pudo pasar a buscar");

    const critico = (await pedir("GET", "/api/reportes/stock-critico")).body.data;
    assert.deepEqual(critico.map((p) => [p.nombre, p.stock, p.stockMinimo]), [["Pre War", 0, 0], ["Barra", 1, 4]]);
    assert.equal((await pedir("GET", "/api/productos/1")).body.data.stock, 17);
});

for (const consulta of [
    "desde=2026-11-30&hasta=2026-11-01",
    "desde=2026-13-01",
    "hasta=ayer",
    "desde=2025-01-01&hasta=2026-11-28",
    "desde=2026-11-01&desde=2026-11-02"
]) {
    test(`F-08: período inválido (${consulta})`, async (t) => {
        const { pedir } = await crearEntorno(t);
        const { status, body } = await pedir("GET", `/api/reportes/ventas?${consulta}`);
        assert.equal(status, 400);
        assert.equal(body.message, Messages.INVALID_PERIOD);
    });
}

test("RN-10: los reportes son solo para el administrador", async (t) => {
    const { pedir, registrarCliente } = await crearEntorno(t);
    const { token } = await registrarCliente();
    for (const reporte of ["ventas", "mas-vendidos", "cancelados", "stock-critico"]) {
        assert.equal((await pedir("GET", `/api/reportes/${reporte}`, { token: null })).status, 401);
        assert.equal((await pedir("GET", `/api/reportes/${reporte}`, { token })).status, 403);
    }
    assert.equal((await pedir("GET", "/api/reportes/mas-vendidos?limite=0")).body.message, Messages.INVALID_LIMIT);
    assert.equal((await pedir("POST", "/api/reportes/ventas", { body: {} })).status, 405);
});
