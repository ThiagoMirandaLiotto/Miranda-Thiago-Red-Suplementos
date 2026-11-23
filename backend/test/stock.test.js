import test from "node:test";
import assert from "node:assert/strict";
import { Messages } from "../src/enums/Messages.js";
import { crearEntorno } from "./helpers.js";

test("F-06: ingreso de mercadería y ajuste quedan en el historial con quién y cuándo", async (t) => {
    const { pedir, crearProducto } = await crearEntorno(t);
    await crearProducto({ stock: 2, stockMinimo: 3 });
    const ingreso = await pedir("POST", "/api/productos/1/movimientos", { body: { tipo: "INGRESO", cantidad: 12 } });
    assert.equal(ingreso.status, 201);
    assert.equal(ingreso.body.data.producto.stock, 14);
    assert.equal(ingreso.body.data.movimiento.observacion, "Ingreso de mercadería");
    assert.equal(ingreso.body.data.alertaStock, false);
    const ajuste = await pedir("POST", "/api/productos/1/movimientos", {
        body: { tipo: "AJUSTE", cantidad: -12, observacion: "  Inventario   de fin de mes " }
    });
    assert.equal(ajuste.body.data.producto.stock, 2);
    assert.equal(ajuste.body.data.movimiento.observacion, "Inventario de fin de mes");
    assert.equal(ajuste.body.data.alertaStock, true);
    const historial = (await pedir("GET", "/api/productos/1/movimientos")).body.data;
    assert.deepEqual(historial.map((m) => [m.tipo, m.cantidad, m.stockResultante]),
        [["AJUSTE", -12, 2], ["INGRESO", 12, 14], ["INGRESO", 2, 2]]);
    assert.equal(historial[0].fecha, new Date(2026, 10, 24, 10).toISOString());
    assert.equal(historial[0].nombreUsuario, "Admin Prueba");
});

for (const [etiqueta, cuerpo, mensaje] of [
    ["venta manual", { tipo: "VENTA", cantidad: 1 }, Messages.INVALID_MOVEMENT_TYPE],
    ["devolución manual", { tipo: "DEVOLUCION", cantidad: 1 }, Messages.INVALID_MOVEMENT_TYPE],
    ["ingreso cero", { tipo: "INGRESO", cantidad: 0 }, Messages.INVALID_INCOME_QUANTITY],
    ["ingreso negativo", { tipo: "INGRESO", cantidad: -3 }, Messages.INVALID_INCOME_QUANTITY],
    ["ingreso decimal", { tipo: "INGRESO", cantidad: 1.5 }, Messages.INVALID_INCOME_QUANTITY],
    ["ingreso enorme", { tipo: "INGRESO", cantidad: 100001 }, Messages.INVALID_INCOME_QUANTITY],
    ["observación larga", { tipo: "INGRESO", cantidad: 1, observacion: "x".repeat(201) }, Messages.INVALID_OBSERVATION],
    ["ajuste cero", { tipo: "AJUSTE", cantidad: 0, observacion: "Conteo" }, Messages.INVALID_ADJUSTMENT_QUANTITY],
    ["ajuste sin motivo", { tipo: "AJUSTE", cantidad: -1 }, Messages.ADJUSTMENT_REASON_REQUIRED],
    ["ajuste con motivo corto", { tipo: "AJUSTE", cantidad: -1, observacion: "ok" }, Messages.ADJUSTMENT_REASON_REQUIRED],
    ["campo extra", { tipo: "INGRESO", cantidad: 1, stock: 99 }, Messages.FIELDS_NOT_ALLOWED]
]) {
    test(`F-06: ${etiqueta} se rechaza sin cambiar el stock`, async (t) => {
        const { pedir, crearProducto } = await crearEntorno(t);
        await crearProducto({ stock: 5 });
        const { status, body } = await pedir("POST", "/api/productos/1/movimientos", { body: cuerpo });
        assert.equal(status, 400);
        assert.equal(body.message, mensaje);
        assert.equal((await pedir("GET", "/api/productos/1")).body.data.stock, 5);
        assert.equal((await pedir("GET", "/api/productos/1/movimientos")).body.data.length, 1);
    });
}

test("F-06: un ajuste no puede dejar el stock negativo; productos inexistentes o dados de baja", async (t) => {
    const { pedir, crearProducto } = await crearEntorno(t);
    await crearProducto({ stock: 3 });
    const negativo = await pedir("POST", "/api/productos/1/movimientos", { body: { tipo: "AJUSTE", cantidad: -4, observacion: "Rotura" } });
    assert.equal(negativo.status, 409);
    assert.equal(negativo.body.message, Messages.NEGATIVE_STOCK("Creatina monohidrato 300 g", 3));
    assert.equal((await pedir("POST", "/api/productos/1/movimientos", { body: { tipo: "AJUSTE", cantidad: -3, observacion: "Rotura" } })).status, 201);
    assert.equal((await pedir("POST", "/api/productos/9/movimientos", { body: { tipo: "INGRESO", cantidad: 1 } })).status, 404);
    assert.equal((await pedir("GET", "/api/productos/9/movimientos")).status, 404);
    await pedir("DELETE", "/api/productos/1");
    assert.equal((await pedir("POST", "/api/productos/1/movimientos", { body: { tipo: "INGRESO", cantidad: 1 } })).status, 404);
    assert.equal((await pedir("GET", "/api/productos/1/movimientos")).status, 200);
});
