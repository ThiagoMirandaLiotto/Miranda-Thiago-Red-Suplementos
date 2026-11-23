import test from "node:test";
import assert from "node:assert/strict";
import { Messages } from "../src/enums/Messages.js";
import { ADMIN, crearEntorno } from "./helpers.js";

const registro = {
    nombre: "Lucía", apellido: "Sosa", email: "Lucia@Correo.com", telefono: "1144556677",
    contrasena: "Entreno2026", confirmacion: "Entreno2026"
};

test("F-01: registro de cliente con sesión abierta y sin exponer la contraseña", async (t) => {
    const { pedir } = await crearEntorno(t);
    const { status, body } = await pedir("POST", "/api/auth/registro", { body: registro, token: null });
    assert.equal(status, 201);
    const { usuario, token, expira } = body.data;
    assert.equal(usuario.rol, "CLIENTE");
    assert.equal(usuario.email, "lucia@correo.com");
    assert.equal(usuario.esSocioGym, false);
    assert.equal(usuario.membresiaActiva, false);
    assert.equal("contrasena" in usuario, false);
    assert.ok(token.length >= 40);
    assert.ok(new Date(expira) > new Date(2026, 10, 24, 17));
    const sesion = await pedir("GET", "/api/auth/sesion", { token });
    assert.equal(sesion.status, 200);
    assert.equal(sesion.body.data.idUsuario, usuario.idUsuario);
    assert.equal("contrasena" in sesion.body.data, false);
});

test("RN-07: no puede haber dos cuentas con el mismo email, sin importar mayúsculas", async (t) => {
    const { pedir } = await crearEntorno(t);
    await pedir("POST", "/api/auth/registro", { body: registro, token: null });
    const repetido = await pedir("POST", "/api/auth/registro", {
        body: { ...registro, email: "  LUCIA@correo.COM " }, token: null
    });
    assert.equal(repetido.status, 409);
    assert.equal(repetido.body.message, Messages.EMAIL_TAKEN);
    const delAdmin = await pedir("POST", "/api/auth/registro", { body: { ...registro, email: ADMIN.email }, token: null });
    assert.equal(delAdmin.status, 409);
});

for (const [etiqueta, cambios, mensaje] of [
    ["V-01 nombre vacío", { nombre: "   " }, Messages.INVALID_FIRST_NAME],
    ["V-01 apellido faltante", { apellido: undefined }, Messages.INVALID_LAST_NAME],
    ["V-01 teléfono faltante", { telefono: undefined }, Messages.INVALID_PHONE],
    ["V-02 email sin dominio", { email: "lucia@correo" }, Messages.INVALID_EMAIL],
    ["V-02 email con espacios", { email: "lu cia@correo.com" }, Messages.INVALID_EMAIL],
    ["V-03 contraseña corta", { contrasena: "Ab1", confirmacion: "Ab1" }, Messages.INVALID_PASSWORD],
    ["V-03 contraseña sin números", { contrasena: "SoloLetras", confirmacion: "SoloLetras" }, Messages.INVALID_PASSWORD],
    ["V-03 contraseña sin letras", { contrasena: "12345678", confirmacion: "12345678" }, Messages.INVALID_PASSWORD],
    ["V-03 confirmación distinta", { confirmacion: "Entreno2027" }, Messages.PASSWORD_MISMATCH],
    ["V-07 teléfono con guiones", { telefono: "11-4455-6677" }, Messages.INVALID_PHONE],
    ["V-07 teléfono corto", { telefono: "1234567" }, Messages.INVALID_PHONE],
    ["V-07 teléfono largo", { telefono: "1234567890123456" }, Messages.INVALID_PHONE],
    ["socio no booleano", { esSocioGym: "sí" }, Messages.INVALID_MEMBER_FLAG],
    ["rol impuesto", { rol: "ADMINISTRADOR" }, Messages.FIELDS_NOT_ALLOWED]
]) {
    test(`Registro: ${etiqueta}`, async (t) => {
        const { pedir } = await crearEntorno(t);
        const { status, body } = await pedir("POST", "/api/auth/registro", { body: { ...registro, ...cambios }, token: null });
        assert.equal(status, 400);
        assert.equal(body.message, mensaje);
        const login = await pedir("POST", "/api/auth/login", { body: { email: registro.email, contrasena: registro.contrasena }, token: null });
        assert.equal(login.status, 401);
    });
}

test("Login: credenciales correctas, incorrectas y faltantes", async (t) => {
    const { pedir } = await crearEntorno(t);
    await pedir("POST", "/api/auth/registro", { body: registro, token: null });
    const ok = await pedir("POST", "/api/auth/login", { body: { email: " LUCIA@correo.com", contrasena: "Entreno2026" }, token: null });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.data.usuario.nombre, "Lucía");
    for (const credenciales of [
        { email: "lucia@correo.com", contrasena: "Entreno2027" },
        { email: "nadie@correo.com", contrasena: "Entreno2026" }
    ]) {
        const fallido = await pedir("POST", "/api/auth/login", { body: credenciales, token: null });
        assert.equal(fallido.status, 401);
        assert.equal(fallido.body.message, Messages.INVALID_CREDENTIALS);
    }
    const vacio = await pedir("POST", "/api/auth/login", { body: { email: "", contrasena: "" }, token: null });
    assert.equal(vacio.status, 400);
    assert.equal(vacio.body.message, Messages.MISSING_CREDENTIALS);
    const admin = await pedir("POST", "/api/auth/login", { body: { email: ADMIN.email, contrasena: ADMIN.contrasena }, token: null });
    assert.equal(admin.body.data.usuario.rol, "ADMINISTRADOR");
    assert.ok(admin.body.data.usuario.fechaUltimoAcceso);
});

test("Logout invalida el token y la sesión vence a las 8 horas", async (t) => {
    const { pedir, registrarCliente, reloj } = await crearEntorno(t);
    const { token } = await registrarCliente();
    assert.equal((await pedir("POST", "/api/auth/logout", { token })).status, 200);
    const cerrada = await pedir("GET", "/api/auth/sesion", { token });
    assert.equal(cerrada.status, 401);
    assert.equal(cerrada.body.message, Messages.SESSION_EXPIRED);

    const nueva = await registrarCliente();
    reloj.avanzarHoras(7.9);
    assert.equal((await pedir("GET", "/api/auth/sesion", { token: nueva.token })).status, 200);
    reloj.avanzarHoras(0.2);
    assert.equal((await pedir("GET", "/api/auth/sesion", { token: nueva.token })).status, 401);
});

test("Token ausente, mal formado o inventado", async (t) => {
    const { request } = await crearEntorno(t);
    assert.equal((await request("GET", "/api/auth/sesion")).body.message, Messages.UNAUTHORIZED);
    for (const encabezado of ["Bearer", "Basic abc", "Bearer corto", `Bearer ${"x".repeat(43)}`]) {
        const { status, body } = await request("GET", "/api/auth/sesion", undefined, false, { Authorization: encabezado });
        assert.equal(status, 401);
        assert.equal(body.message, Messages.SESSION_EXPIRED);
    }
});

test("Perfil: el cliente edita sus datos y, si cambia lo que declara como socio, vuelve a verificarse", async (t) => {
    const { pedir, registrarCliente } = await crearEntorno(t);
    const { token, usuario } = await registrarCliente({ esSocioGym: true });
    const verificado = await pedir("PATCH", `/api/clientes/${usuario.idUsuario}/membresia`, { body: { membresiaActiva: true } });
    assert.equal(verificado.body.data.descuento, 10);
    const perfil = { nombre: "Cliente", apellido: "Editado", telefono: "1199887766", esSocioGym: true };
    const editado = await pedir("PUT", "/api/perfil", { body: perfil, token });
    assert.equal(editado.status, 200);
    assert.equal(editado.body.data.apellido, "Editado");
    assert.equal(editado.body.data.membresiaActiva, true);
    const sinSocio = await pedir("PUT", "/api/perfil", { body: { ...perfil, esSocioGym: false }, token });
    assert.equal(sinSocio.body.data.membresiaActiva, false);
    assert.equal(sinSocio.body.data.descuento, 0);
    const conEmail = await pedir("PUT", "/api/perfil", { body: { ...perfil, email: "otro@correo.com" }, token });
    assert.equal(conEmail.status, 400);
    assert.equal((await pedir("GET", "/api/perfil")).status, 403);
});

test("Clientes: el administrador los lista y verifica la membresía; un cliente no puede", async (t) => {
    const { pedir, registrarCliente } = await crearEntorno(t);
    const declarada = await registrarCliente({ nombre: "Sofía", apellido: "Ruiz", esSocioGym: true });
    await registrarCliente({ nombre: "Juan", apellido: "Pérez" });
    const lista = await pedir("GET", "/api/clientes");
    assert.deepEqual(lista.body.data.map((cliente) => cliente.apellido), ["Pérez", "Ruiz"]);
    assert.equal(lista.body.data.some((cliente) => "contrasena" in cliente), false);
    assert.equal((await pedir("GET", "/api/clientes?busqueda=sofi")).body.data.length, 1);
    const verificada = await pedir("PATCH", `/api/clientes/${declarada.usuario.idUsuario}/membresia`, { body: { membresiaActiva: true } });
    assert.equal(verificada.body.data.membresiaActiva, true);
    assert.equal(verificada.body.data.descuento, 10);
    assert.equal((await pedir("PATCH", "/api/clientes/1/membresia", { body: { membresiaActiva: true } })).status, 404);
    assert.equal((await pedir("PATCH", "/api/clientes/99/membresia", { body: { membresiaActiva: true } })).status, 404);
    const invalida = await pedir("PATCH", `/api/clientes/${declarada.usuario.idUsuario}/membresia`, { body: { membresiaActiva: "si" } });
    assert.equal(invalida.body.message, Messages.INVALID_MEMBERSHIP);
    assert.equal((await pedir("GET", "/api/clientes", { token: declarada.token })).status, 403);
});
