import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// Contraseñas con scrypt (incluido en Node) y sal aleatoria: nunca se guardan en texto plano.
const LARGO_HASH = 64;

export function hashContrasena(contrasena) {
    const sal = randomBytes(16);
    const hash = scryptSync(contrasena, sal, LARGO_HASH);
    return `scrypt:${sal.toString("hex")}:${hash.toString("hex")}`;
}

export function verificarContrasena(contrasena, guardada) {
    const [algoritmo, salHex, hashHex] = String(guardada).split(":");
    if (algoritmo !== "scrypt" || !salHex || !hashHex) return false;
    const esperado = Buffer.from(hashHex, "hex");
    const calculado = scryptSync(contrasena, Buffer.from(salHex, "hex"), esperado.length);
    // Comparación en tiempo constante: no revela cuántos caracteres coinciden.
    return timingSafeEqual(esperado, calculado);
}
