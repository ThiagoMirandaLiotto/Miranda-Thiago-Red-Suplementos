import test from "node:test";
import assert from "node:assert/strict";
import { Messages } from "../src/enums/Messages.js";
import { crearEntorno } from "./helpers.js";

test("Carrito: agregar, sumar, modificar cantidades, quitar y vaciar, con importes calculados por la API", async (t) => {
    const { pedir, agregar, crearProducto } = await crearEntorno(t);
    await crearProducto({ precio: 25000.50, stock: 10 });
    await crearProducto({ nombre: "Barra", idCategoria: 5, precio: 2400, stock: 40 });

    const primero = await agregar(1, 2);
    assert.equal(primero.status, 201);
    assert.equal(primero.body.data.subtotal, 50001);
    await agregar(2, 3);
    const sumado = await agregar(1, 1);
    assert.deepEqual(sumado.body.data.items.map((item) => [item.idProducto, item.cantidad]), [[1, 3], [2, 3]]);
    assert.equal(sumado.body.data.unidades, 6);
    assert.equal(sumado.body.data.subtotal, 82201.5);
    assert.equal(sumado.body.data.total, 82201.5);
    assert.equal(sumado.body.data.listoParaConfirmar, true);

    const modificado = await pedir("PATCH", "/api/carrito/items/2", { body: { cantidad: 1 } });
    assert.equal(modificado.status, 200);
    assert.equal(modificado.body.data.items[1].subtotal, 2400);
    const sinBarra = await pedir("DELETE", "/api/carrito/items/2");
    assert.equal(sinBarra.body.data.items.length, 1);
    assert.equal((await pedir("DELETE", "/api/carrito/items/2")).status, 404);
    const vacio = await pedir("DELETE", "/api/carrito");
    assert.deepEqual(vacio.body.data.items, []);
    assert.equal(vacio.body.data.listoParaConfirmar, false);
});

test("RN-01: no se agrega sin stock ni más de lo que hay, tampoco sumando lo que ya está en el carrito", async (t) => {
    const { pedir, agregar, crearProducto } = await crearEntorno(t);
    await crearProducto({ stock: 3 });
    await crearProducto({ nombre: "Agotado", stock: 0 });

    const demasiado = await agregar(1, 4);
    assert.equal(demasiado.status, 409);
    assert.equal(demasiado.body.message, Messages.INSUFFICIENT_STOCK("Creatina monohidrato 300 g", 3));
    await agregar(1, 2);
    const sumando = await agregar(1, 2);
    assert.equal(sumando.status, 409);
    assert.equal(sumando.body.message, Messages.INSUFFICIENT_STOCK("Creatina monohidrato 300 g", 3, 2));
    const agotado = await agregar(2, 1);
    assert.equal(agotado.body.message, "«Agotado» no tiene stock.");
    const cambio = await pedir("PATCH", "/api/carrito/items/1", { body: { cantidad: 5 } });
    assert.equal(cambio.status, 409);
    assert.equal((await pedir("GET", "/api/carrito")).body.data.items[0].cantidad, 2);
});

for (const [etiqueta, cantidad] of [["cero", 0], ["negativa", -1], ["decimal", 1.5], ["texto", "2"], ["nula", null]]) {
    test(`V-04: cantidad ${etiqueta} se rechaza`, async (t) => {
        const { pedir, agregar, crearProducto } = await crearEntorno(t);
        await crearProducto();
        const resultado = await agregar(1, cantidad);
        assert.equal(resultado.status, 400);
        assert.equal(resultado.body.message, Messages.INVALID_QUANTITY);
        await agregar(1, 1);
        const cambio = await pedir("PATCH", "/api/carrito/items/1", { body: { cantidad } });
        assert.equal(cambio.status, 400);
    });
}

test("Carrito: productos inexistentes, dados de baja e IDs inválidos", async (t) => {
    const { pedir, agregar, crearProducto } = await crearEntorno(t);
    await crearProducto();
    assert.equal((await agregar(99, 1)).status, 404);
    assert.equal((await agregar("1", 1)).body.message, Messages.INVALID_PRODUCT_ID);
    assert.equal((await pedir("PATCH", "/api/carrito/items/abc", { body: { cantidad: 1 } })).status, 400);
    assert.equal((await pedir("PATCH", "/api/carrito/items/1", { body: { cantidad: 1 } })).body.message, Messages.PRODUCT_NOT_IN_CART);
    await agregar(1, 1);
    await pedir("DELETE", "/api/productos/1");
    const vista = await pedir("GET", "/api/carrito");
    assert.equal(vista.body.data.items[0].problema, Messages.PRODUCT_UNAVAILABLE("Creatina monohidrato 300 g"));
    assert.equal(vista.body.data.listoParaConfirmar, false);
    assert.equal((await agregar(1, 1)).status, 404);
    const extra = await pedir("POST", "/api/carrito/items", { body: { idProducto: 1, cantidad: 1, precio: 1 } });
    assert.equal(extra.body.message, Messages.FIELDS_NOT_ALLOWED);
});

test("El carrito es del administrador: sin sesión 401 y un cliente 403", async (t) => {
    const { pedir, registrarCliente } = await crearEntorno(t);
    const { token } = await registrarCliente();
    assert.equal((await pedir("GET", "/api/carrito", { token: null })).status, 401);
    assert.equal((await pedir("GET", "/api/carrito", { token })).status, 403);
    assert.equal((await pedir("POST", "/api/carrito/items", { body: { idProducto: 1, cantidad: 1 }, token })).status, 403);
});

test("RN-09: el carrito muestra el 10 % solo para un socio con la membresía verificada", async (t) => {
    const { pedir, agregar, crearProducto, registrarCliente } = await crearEntorno(t);
    await crearProducto({ precio: 1000, stock: 10 });
    await agregar(1, 3);
    const socio = await registrarCliente({ esSocioGym: true });
    const sinVerificar = await pedir("GET", `/api/carrito?idCliente=${socio.usuario.idUsuario}`);
    assert.equal(sinVerificar.body.data.descuento, 0);
    await pedir("PATCH", `/api/clientes/${socio.usuario.idUsuario}/membresia`, { body: { membresiaActiva: true } });
    const verificado = await pedir("GET", `/api/carrito?idCliente=${socio.usuario.idUsuario}`);
    assert.equal(verificado.body.data.porcentajeDescuento, 10);
    assert.equal(verificado.body.data.descuento, 300);
    assert.equal(verificado.body.data.total, 2700);
    assert.equal((await pedir("GET", "/api/carrito?idCliente=1")).status, 404);
    assert.equal((await pedir("GET", "/api/carrito?idCliente=x")).status, 400);
});
