import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import express from "express";
import { createApp } from "../src/app.js";
import errorHandler from "../src/middlewares/errorHandler.js";
import { Messages } from "../src/enums/Messages.js";
import ProductoRepository from "../src/repositories/ProductoRepository.js";
import CategoriaRepository from "../src/repositories/CategoriaRepository.js";
import ProductoService from "../src/services/ProductoService.js";

const validProduct = {
    nombre: "Creatina monohidrato 300 g", marca: "Star Nutrition", idCategoria: 2,
    descripcion: "Producto de prueba", precio: 25000.50, stock: 10,
    stockMinimo: 3, sabor: "Sin sabor", imagen: ""
};

async function start(t, app = createApp()) {
    const server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    t.after(() => new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
        server.closeAllConnections();
    }));
    const base = `http://127.0.0.1:${server.address().port}`;
    return async (method, path, body, raw = false, headers = {}) => {
        const response = await fetch(base + path, {
            method,
            headers: { ...(body === undefined ? {} : { "Content-Type": "application/json" }), ...headers },
            body: body === undefined ? undefined : raw ? body : JSON.stringify(body)
        });
        assert.match(response.headers.get("content-type"), /application\/json/);
        const data = await response.json();
        if (response.status >= 400) {
            assert.deepEqual(Object.keys(data).sort(), ["message", "success"]);
            assert.equal(data.success, false);
        } else {
            assert.deepEqual(Object.keys(data).sort(), ["data", "success"]);
            assert.equal(data.success, true);
        }
        return { status: response.status, body: data, headers: response.headers };
    };
}

test("CRUD HTTP completo y baja lógica visible como 404", async (t) => {
    const request = await start(t);
    assert.deepEqual((await request("GET", "/api/productos")).body.data, []);
    const created = await request("POST", "/api/productos", validProduct);
    assert.equal(created.status, 201);
    assert.equal(created.headers.get("location"), "/api/productos/1");
    assert.equal(created.body.data.idProducto, 1);
    assert.equal(created.body.data.activo, true);
    assert.equal((await request("GET", "/api/productos")).body.data.length, 1);
    assert.equal((await request("GET", "/api/productos/1")).body.data.precio, 25000.50);
    const changed = await request("PUT", "/api/productos/1", { ...validProduct, precio: 30000, stock: 0 });
    assert.equal(changed.status, 200);
    assert.equal(changed.body.data.stock, 0);
    assert.equal((await request("GET", "/api/productos/1")).body.data.precio, 30000);
    const deleted = await request("DELETE", "/api/productos/1");
    assert.equal(deleted.status, 200);
    assert.equal(deleted.body.data.activo, false);
    assert.deepEqual((await request("GET", "/api/productos")).body.data, []);
    for (const method of ["GET", "PUT", "DELETE"]) {
        const result = await request(method, "/api/productos/1", method === "PUT" ? validProduct : undefined);
        assert.equal(result.status, 404);
        assert.equal(result.body.message, Messages.PRODUCT_NOT_FOUND);
    }
    const second = await request("POST", "/api/productos", validProduct);
    assert.equal(second.body.data.idProducto, 2);
});

test("Baja conserva el registro en el array y las copias no modifican el repositorio", () => {
    const repository = new ProductoRepository();
    const service = new ProductoService(repository, new CategoriaRepository());
    service.create(validProduct);
    const copy = repository.findById(1);
    copy.stock = -100;
    assert.equal(repository.findById(1).stock, 10);
    service.delete(1);
    assert.equal(repository.findAll().length, 1);
    assert.equal(repository.findById(1).activo, false);
});

test("Duplicados se rechazan al crear y modificar, sin alterar el registro", async (t) => {
    const request = await start(t);
    await request("POST", "/api/productos", validProduct);
    const duplicate = await request("POST", "/api/productos", { ...validProduct, nombre: "  CREATINA   MONOHIDRATO 300 G " });
    assert.equal(duplicate.status, 409);
    assert.equal(duplicate.body.message, Messages.DUPLICATED_RESOURCE);
    assert.equal((await request("PUT", "/api/productos/1", validProduct)).status, 200);
    await request("POST", "/api/productos", { ...validProduct, sabor: "Limón" });
    assert.equal((await request("PUT", "/api/productos/2", validProduct)).status, 409);
    assert.equal((await request("GET", "/api/productos/2")).body.data.sabor, "Limón");
});

for (const [label, changes, message] of [
    ["nombre vacío", { nombre: " " }, Messages.INVALID_NAME],
    ["precio cero", { precio: 0 }, Messages.INVALID_PRICE],
    ["precio negativo", { precio: -10 }, Messages.INVALID_PRICE],
    ["precio como string", { precio: "10" }, Messages.INVALID_PRICE],
    ["precio con tres decimales", { precio: 12.345 }, Messages.INVALID_PRICE],
    ["stock negativo", { stock: -1 }, Messages.INVALID_STOCK],
    ["stock fraccionario", { stock: 1.5 }, Messages.INVALID_STOCK],
    ["stock faltante", { stock: undefined }, Messages.INVALID_STOCK],
    ["mínimo nulo", { stockMinimo: null }, Messages.INVALID_MINIMUM_STOCK],
    ["categoría como string", { idCategoria: "2" }, Messages.INVALID_CATEGORY],
    ["categoría inexistente", { idCategoria: 999 }, Messages.CATEGORY_NOT_FOUND],
    ["marca nula", { marca: null }, Messages.INVALID_TEXT],
    ["ID impuesto", { idProducto: 99 }, Messages.UNKNOWN_FIELDS],
    ["activo impuesto", { activo: false }, Messages.UNKNOWN_FIELDS]
]) {
    test(`Validación: ${label}`, async (t) => {
        const request = await start(t);
        const result = await request("POST", "/api/productos", { ...validProduct, ...changes });
        assert.equal(result.status, 400);
        assert.equal(result.body.message, message);
        assert.deepEqual((await request("GET", "/api/productos")).body.data, []);
    });
}

test("Valores por defecto y precio decimal 0.29", async (t) => {
    const request = await start(t);
    const result = await request("POST", "/api/productos", { nombre: "Barra", idCategoria: 5, precio: 0.29, stock: 0 });
    assert.equal(result.status, 201);
    assert.equal(result.body.data.stockMinimo, 0);
    assert.equal(result.body.data.marca, "");
});

test("PUT exige reemplazo completo y no cambia datos ante un error", async (t) => {
    const request = await start(t);
    await request("POST", "/api/productos", validProduct);
    assert.equal((await request("PUT", "/api/productos/1", { precio: 50 })).status, 400);
    assert.equal((await request("GET", "/api/productos/1")).body.data.precio, validProduct.precio);
});

test("IDs inválidos y recursos ausentes", async (t) => {
    const request = await start(t);
    for (const id of ["abc", "1abc", "0", "-1", "1.5", "01", "9007199254740992"]) {
        assert.equal((await request("GET", `/api/productos/${id}`)).status, 400);
    }
    assert.equal((await request("GET", "/api/productos/999")).status, 404);
});

test("JSON roto, array, cuerpo vacío, formato y tamaño inválidos", async (t) => {
    const request = await start(t);
    const malformed = await request("POST", "/api/productos", '{"nombre":', true);
    assert.equal(malformed.status, 400);
    assert.equal(malformed.body.message, Messages.INVALID_JSON);
    assert.equal((await request("POST", "/api/productos", [])).status, 400);
    assert.equal((await request("POST", "/api/productos", "", true)).status, 400);
    assert.equal((await request("POST", "/api/productos", "hola", true, { "Content-Type": "text/plain" })).status, 415);
    const big = await request("POST", "/api/productos", { ...validProduct, descripcion: "a".repeat(110000) });
    assert.equal(big.status, 413);
    assert.equal(big.body.message, Messages.PAYLOAD_TOO_LARGE);
});

test("Categorías precargadas, rutas y métodos desconocidos", async (t) => {
    const request = await start(t);
    const categories = await request("GET", "/api/categorias");
    assert.equal(categories.body.data.length, 5);
    assert.equal(categories.body.data[1].nombre, "Creatina");
    assert.equal((await request("GET", "/ruta-inexistente")).status, 404);
    const result = await request("PATCH", "/api/productos/1", { stock: 2 });
    assert.equal(result.status, 405);
    assert.equal(result.headers.get("allow"), "GET, HEAD, PUT, DELETE");
});

test("Cada nueva aplicación reinicia sus arrays", async (t) => {
    const first = await start(t);
    await first("POST", "/api/productos", validProduct);
    const second = await start(t);
    assert.deepEqual((await second("GET", "/api/productos")).body.data, []);
});

test("Un error inesperado devuelve 500 sin filtrar detalles internos", async (t) => {
    const app = express();
    app.get("/fallo", () => { throw new Error("detalle interno privado"); });
    app.use(errorHandler);
    t.mock.method(console, "error", () => {});
    const request = await start(t, app);
    const result = await request("GET", "/fallo");
    assert.equal(result.status, 500);
    assert.equal(result.body.message, Messages.INTERNAL_SERVER_ERROR);
});
