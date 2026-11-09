import { useSyncExternalStore } from "react";

// Preferencias de movimiento: la del sistema (reducido) y la del botón "Pausar animaciones".
// La pausa se refleja en <html data-movimiento="pausado">, de donde la toma el CSS de los bucles.
const CLAVE = "red-movimiento";
const oyentes = new Set();
const consultaReducido = typeof window === "undefined" ? null : window.matchMedia("(prefers-reduced-motion: reduce)");

function leerPausa() {
    try {
        return window.localStorage.getItem(CLAVE) === "pausado";
    } catch {
        return false;
    }
}

let pausado = typeof window === "undefined" ? false : leerPausa();
aplicarPausa();

function aplicarPausa() {
    if (typeof document === "undefined") return;
    if (pausado) document.documentElement.dataset.movimiento = "pausado";
    else delete document.documentElement.dataset.movimiento;
}

export function alternarPausa() {
    pausado = !pausado;
    aplicarPausa();
    try {
        window.localStorage.setItem(CLAVE, pausado ? "pausado" : "activo");
    } catch {
        // Sin almacenamiento, la preferencia dura hasta recargar.
    }
    oyentes.forEach((oyente) => oyente());
}

function suscribirPausa(oyente) {
    oyentes.add(oyente);
    return () => oyentes.delete(oyente);
}

function suscribirReducido(oyente) {
    consultaReducido?.addEventListener("change", oyente);
    return () => consultaReducido?.removeEventListener("change", oyente);
}

export function useMovimientoPausado() {
    return useSyncExternalStore(suscribirPausa, () => pausado, () => false);
}

export function useMovimientoReducido() {
    return useSyncExternalStore(suscribirReducido, () => consultaReducido?.matches ?? false, () => false);
}

// Hay puntero fino y movimiento permitido: las respuestas al mouse solo tienen sentido acá.
export function punteroConMovimiento() {
    return window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches;
}
