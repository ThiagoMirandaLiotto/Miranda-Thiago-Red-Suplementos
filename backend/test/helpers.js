import assert from "node:assert/strict";
import { once } from "node:events";
import { createApp } from "../src/app.js";
import { crearReloj } from "../src/utils/reloj.js";

export const ADMIN = Object.freeze({
    email: "admin@prueba.com", contrasena: "Admin12345", nombre: "Admin", apellido: "Prueba"
});

// Martes 24/11/2026 a las 10:00 (hora local): las pruebas no dependen del día en que se ejecutan.
export const AHORA = new Date(2026, 10, 24, 10, 0, 0);

export const validProduct = Object.freeze({
    nombre: "Creatina monohidrato 300 g", marca: "Star Nutrition", idCategoria: 2,
    descripcion: "Producto de prueba", precio: 25000.50, stock: 10,
    stockMinimo: 3, sabor: "Sin sabor", imagen: ""
});

export function nuevaApp(reloj = crearReloj(AHORA)) {
    return createApp({ reloj, admin: ADMIN });
}

// Levanta la API en un puerto libre. request(method, path, body, raw, headers) controla además
// el formato de todas las respuestas: { success, data } o { success: false, message }.
export async function start(t, app = nuevaApp(), headersFijos = {}) {
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
            headers: {
                ...(body === undefined ? {} : { "Content-Type": "application/json" }),
                ...headersFijos,
                ...headers
            },
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

export const conToken = (token) => ({ Authorization: `Bearer ${token}` });

// Igual que start, pero cada solicitud viaja con la sesión del administrador.
export async function startAdmin(t, app = nuevaApp()) {
    const anonimo = await start(t, app);
    const { body } = await anonimo("POST", "/api/auth/login", { email: ADMIN.email, contrasena: ADMIN.contrasena });
    return start(t, app, conToken(body.data.token));
}

// Entorno completo para las reglas de negocio: API, reloj controlable, sesión del administrador y atajos.
export async function crearEntorno(t, ahora = AHORA) {
    const reloj = crearReloj(ahora);
    const app = nuevaApp(reloj);
    const request = await start(t, app);
    const iniciarSesion = async () =>
        (await request("POST", "/api/auth/login", { email: ADMIN.email, contrasena: ADMIN.contrasena })).body.data.token;
    let tokenAdmin = await iniciarSesion();

    // Las sesiones vencen a las 8 horas: después de adelantar el reloj, las pruebas vuelven a ingresar.
    async function renovarSesion() {
        tokenAdmin = await iniciarSesion();
    }

    const pedir = (method, path, { body, token = tokenAdmin, raw = false } = {}) =>
        request(method, path, body, raw, token ? conToken(token) : {});

    async function crearProducto(cambios = {}) {
        const { status, body } = await pedir("POST", "/api/productos", { body: { ...validProduct, ...cambios } });
        assert.equal(status, 201, body.message);
        return body.data;
    }

    let numeroCliente = 0;
    async function registrarCliente(cambios = {}) {
        numeroCliente++;
        const datos = {
            nombre: "Cliente", apellido: `Prueba ${numeroCliente}`, email: `cliente${numeroCliente}@prueba.com`,
            telefono: "1100000000", contrasena: "Clave1234", confirmacion: "Clave1234", ...cambios
        };
        const { status, body } = await pedir("POST", "/api/auth/registro", { body: datos, token: null });
        assert.equal(status, 201, body.message);
        return { ...body.data, datos };
    }

    const agregar = (idProducto, cantidad) => pedir("POST", "/api/carrito/items", { body: { idProducto, cantidad } });

    // Retiro por defecto: mañana a las 18:00 (dentro del horario y con fecha futura).
    const confirmar = (cambios = {}) => pedir("POST", "/api/pedidos", {
        body: { cliente: { nombre: "Ana", contacto: "@ana.prueba" }, fechaRetiro: "2026-11-25", horaRetiro: "18:00", ...cambios }
    });

    return { request, pedir, reloj, app, renovarSesion, crearProducto, registrarCliente, agregar, confirmar };
}
