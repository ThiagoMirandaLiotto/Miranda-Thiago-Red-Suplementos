import { useEffect, useRef } from "react";
import { punteroConMovimiento } from "./useMovimiento.js";

// Interpola hacia el objetivo cuadro a cuadro: seguir al mouse sin inercia se siente artificial.
// El bucle solo corre mientras hay camino por recorrer.
function crearSeguidor(aplicar, suavizado = 0.16) {
    let x = 0;
    let y = 0;
    let objetivoX = 0;
    let objetivoY = 0;
    let cuadro = null;

    function paso() {
        x += (objetivoX - x) * suavizado;
        y += (objetivoY - y) * suavizado;
        aplicar(x, y);
        const quieto = Math.abs(objetivoX - x) < 0.05 && Math.abs(objetivoY - y) < 0.05;
        cuadro = quieto ? null : requestAnimationFrame(paso);
    }

    return {
        ir(nuevoX, nuevoY) {
            objetivoX = nuevoX;
            objetivoY = nuevoY;
            if (cuadro === null) cuadro = requestAnimationFrame(paso);
        },
        saltar(nuevoX, nuevoY) {
            x = nuevoX;
            y = nuevoY;
            this.ir(nuevoX, nuevoY);
        },
        detener() {
            if (cuadro !== null) cancelAnimationFrame(cuadro);
            cuadro = null;
        }
    };
}

const MAXIMO_MAGNETICO = 12;
const limitar = (valor) => Math.max(-MAXIMO_MAGNETICO, Math.min(MAXIMO_MAGNETICO, valor));

// El llamado principal se acerca un poco al puntero, como si lo atrajera.
export function useMagnetico(fuerza = 0.2) {
    const ref = useRef(null);

    useEffect(() => {
        const elemento = ref.current;
        if (!elemento || !punteroConMovimiento()) return undefined;

        const seguidor = crearSeguidor((x, y) => {
            elemento.style.transform = `translate(${x}px, ${y}px)`;
        });

        function alMover(event) {
            const caja = elemento.getBoundingClientRect();
            seguidor.ir(
                limitar((event.clientX - caja.left - caja.width / 2) * fuerza),
                limitar((event.clientY - caja.top - caja.height / 2) * fuerza)
            );
        }
        const alSalir = () => seguidor.ir(0, 0);

        elemento.addEventListener("pointermove", alMover);
        elemento.addEventListener("pointerleave", alSalir);
        return () => {
            elemento.removeEventListener("pointermove", alMover);
            elemento.removeEventListener("pointerleave", alSalir);
            seguidor.detener();
        };
    }, [fuerza]);

    return ref;
}

// La foto del destacado se inclina hacia el puntero, sin pasar de los 7° del logo.
export function useInclinacion(maximo = 7) {
    const ref = useRef(null);

    useEffect(() => {
        const elemento = ref.current;
        if (!elemento || !punteroConMovimiento()) return undefined;

        const seguidor = crearSeguidor((x, y) => {
            elemento.style.transform = `perspective(1000px) rotateX(${-y}deg) rotateY(${x}deg)`;
        }, 0.12);

        function alMover(event) {
            const caja = elemento.getBoundingClientRect();
            seguidor.ir(
                ((event.clientX - caja.left) / caja.width - 0.5) * maximo,
                ((event.clientY - caja.top) / caja.height - 0.5) * maximo
            );
        }
        const alSalir = () => seguidor.ir(0, 0);

        elemento.addEventListener("pointermove", alMover);
        elemento.addEventListener("pointerleave", alSalir);
        return () => {
            elemento.removeEventListener("pointermove", alMover);
            elemento.removeEventListener("pointerleave", alSalir);
            seguidor.detener();
        };
    }, [maximo]);

    return ref;
}

// La vista previa del índice de categorías sigue al puntero dentro de su contenedor.
export function useSeguirPuntero() {
    const contenedorRef = useRef(null);
    const marcoRef = useRef(null);

    useEffect(() => {
        const contenedor = contenedorRef.current;
        const marco = marcoRef.current;
        if (!contenedor || !marco || !punteroConMovimiento()) return undefined;

        const seguidor = crearSeguidor((x, y) => {
            marco.style.transform = `translate(${x}px, ${y}px)`;
        }, 0.18);
        let adentro = false;

        function alMover(event) {
            const caja = contenedor.getBoundingClientRect();
            const x = event.clientX - caja.left - marco.offsetWidth / 2;
            const y = event.clientY - caja.top - marco.offsetHeight / 2;
            // Al entrar aparece bajo el puntero, sin cruzar la pantalla desde donde quedó.
            if (adentro) seguidor.ir(x, y);
            else seguidor.saltar(x, y);
            adentro = true;
        }
        const alSalir = () => {
            adentro = false;
        };

        // "pointerover" cubre el scroll con el mouse quieto: la fila llega bajo el puntero sin que se mueva.
        contenedor.addEventListener("pointermove", alMover);
        contenedor.addEventListener("pointerover", alMover);
        contenedor.addEventListener("pointerleave", alSalir);
        return () => {
            contenedor.removeEventListener("pointermove", alMover);
            contenedor.removeEventListener("pointerover", alMover);
            contenedor.removeEventListener("pointerleave", alSalir);
            seguidor.detener();
        };
    }, []);

    return { contenedorRef, marcoRef };
}
