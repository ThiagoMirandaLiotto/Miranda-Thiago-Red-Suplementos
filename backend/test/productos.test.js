import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import errorHandler from "../src/middlewares/errorHandler.js";
import { Messages } from "../src/enums/Messages.js";
import ProductoRepository from "../src/repositories/ProductoRepository.js";
import CategoriaRepository from "../src/repositories/CategoriaRepository.js";
import MovimientoStockRepository from "../src/repositories/MovimientoStockRepository.js";
import ProductoService from "../src/services/ProductoService.js";
import StockService from "../src/services/StockService.js";
import { crearReloj } from "../src/utils/reloj.js";
import { crearEntorno, start, startAdmin, validProduct } from "./helpers.js";

// Pruebas de la Entrega 2. Desde la Entrega 4, crear, modificar y dar de baja
// exige la sesión del administrador (RN-10): por eso usan startAdmin.

test("CRUD HTTP completo y baja lógica visible como 404", async (t) => {
    const request = await startAdmin(t);
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
    const stockService = new StockService(repository, new MovimientoStockRepository(), crearReloj());
    const service = new ProductoService(repository, new CategoriaRepository(), stockService);
    service.create(validProduct);
    const copy = repository.findById(1);
    copy.stock = -100;
    assert.equal(repository.findById(1).stock, 10);
    service.delete(1);
    assert.equal(repository.findAll().length, 1);
    assert.equal(repository.findById(1).activo, false);
});

test("Duplicados se rechazan al crear y modificar, sin alterar el registro", async (t) => {
    const request = await startAdmin(t);
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
        const request = await startAdmin(t);
        const result = await request("POST", "/api/productos", { ...validProduct, ...changes });
        assert.equal(result.status, 400);
        assert.equal(result.body.message, message);
        assert.deepEqual((await request("GET", "/api/productos")).body.data, []);
    });
}

test("Valores por defecto y precio decimal 0.29", async (t) => {
    const request = await startAdmin(t);
    const result = await request("POST", "/api/productos", { nombre: "Barra", idCategoria: 5, precio: 0.29, stock: 0 });
    assert.equal(result.status, 201);
    assert.equal(result.body.data.stockMinimo, 0);
    assert.equal(result.body.data.marca, "");
});

test("PUT exige reemplazo completo y no cambia datos ante un error", async (t) => {
    const request = await startAdmin(t);
    await request("POST", "/api/productos", validProduct);
    assert.equal((await request("PUT", "/api/productos/1", { precio: 50 })).status, 400);
    assert.equal((await request("GET", "/api/productos/1")).body.data.precio, validProduct.precio);
});

test("IDs inválidos y recursos ausentes", async (t) => {
    const request = await startAdmin(t);
    for (const id of ["abc", "1abc", "0", "-1", "1.5", "01", "9007199254740992"]) {
        assert.equal((await request("GET", `/api/productos/${id}`)).status, 400);
    }
    assert.equal((await request("GET", "/api/productos/999")).status, 404);
});

test("JSON roto, array, cuerpo vacío, formato y tamaño inválidos", async (t) => {
    const request = await startAdmin(t);
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
    const request = await startAdmin(t);
    const categories = await request("GET", "/api/categorias");
    assert.equal(categories.body.data.length, 5);
    assert.equal(categories.body.data[1].nombre, "Creatina");
    assert.equal((await request("GET", "/ruta-inexistente")).status, 404);
    const result = await request("PATCH", "/api/productos/1", { stock: 2 });
    assert.equal(result.status, 405);
    assert.equal(result.headers.get("allow"), "GET, HEAD, PUT, DELETE");
});

test("Cada nueva aplicación reinicia sus arrays", async (t) => {
    const first = await startAdmin(t);
    await first("POST", "/api/productos", validProduct);
    const second = await start(t);
    assert.deepEqual((await second("GET", "/api/productos")).body.data, []);
});

// Entrega 4 ---------------------------------------------------------------

test("RN-10: el catálogo es público, pero solo el administrador lo modifica", async (t) => {
    const { pedir, registrarCliente, crearProducto } = await crearEntorno(t);
    await crearProducto();
    const { token } = await registrarCliente();
    assert.equal((await pedir("GET", "/api/productos", { token: null })).status, 200);
    assert.equal((await pedir("GET", "/api/productos/1", { token: null })).status, 200);
    for (const [method, path, body] of [
        ["POST", "/api/productos", validProduct],
        ["PUT", "/api/productos/1", validProduct],
        ["DELETE", "/api/productos/1"],
        ["GET", "/api/productos/1/movimientos"]
    ]) {
        const sinSesion = await pedir(method, path, { body, token: null });
        assert.equal(sinSesion.status, 401);
        assert.equal(sinSesion.body.message, Messages.UNAUTHORIZED);
        assert.equal(sinSesion.headers.get("www-authenticate"), "Bearer");
        const comoCliente = await pedir(method, path, { body, token });
        assert.equal(comoCliente.status, 403);
        assert.equal(comoCliente.body.message, Messages.FORBIDDEN);
    }
    assert.equal((await pedir("GET", "/api/productos/1", { token: null })).body.data.activo, true);
});

test("El alta registra el stock inicial como INGRESO y PUT sin stock conserva el actual", async (t) => {
    const { pedir, crearProducto } = await crearEntorno(t);
    await crearProducto({ stock: 7 });
    const sinStock = { ...validProduct };
    delete sinStock.stock;
    const cambiado = await pedir("PUT", "/api/productos/1", { body: { ...sinStock, precio: 26000 } });
    assert.equal(cambiado.status, 200);
    assert.equal(cambiado.body.data.stock, 7);
    assert.equal(cambiado.body.data.precio, 26000);
    const corregido = await pedir("PUT", "/api/productos/1", { body: { ...validProduct, stock: 5 } });
    assert.equal(corregido.body.data.stock, 5);
    const movimientos = (await pedir("GET", "/api/productos/1/movimientos")).body.data;
    assert.deepEqual(movimientos.map((m) => [m.tipo, m.cantidad, m.stockResultante]), [["AJUSTE", -2, 5], ["INGRESO", 7, 7]]);
    assert.equal(movimientos[1].observacion, "Stock inicial");
    assert.equal(movimientos[1].nombreUsuario, "Admin Prueba");
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
