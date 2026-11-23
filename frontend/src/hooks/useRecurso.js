import { useCallback, useEffect, useRef, useState } from "react";
import { notify } from "../utils/notify.js";

// Carga un recurso de la API con los tres estados de siempre (cargando, listo, error) y "recargar".
// "clave" identifica qué se pide: cuando cambia (otro filtro, otro período), se vuelve a cargar.
// Mientras recarga se conservan los datos anteriores, así la pantalla no salta.
export function useRecurso(cargar, { clave = "", idAviso } = {}) {
    const cargarRef = useRef(cargar);
    const [intento, setIntento] = useState(0);
    const [resultado, setResultado] = useState({ clave: null, intento: -1, status: "loading", datos: null, error: null });

    useEffect(() => {
        cargarRef.current = cargar;
    });

    useEffect(() => {
        const controller = new AbortController();
        cargarRef.current(controller.signal)
            .then((datos) => setResultado({ clave, intento, status: "success", datos, error: null }))
            .catch((error) => {
                // StrictMode monta dos veces: la primera carga se cancela sin avisar.
                if (controller.signal.aborted) return;
                setResultado((anterior) => ({ ...anterior, clave, intento, status: "error", error }));
                if (idAviso) notify.error(error, { id: idAviso });
            });
        return () => controller.abort();
    }, [clave, intento, idAviso]);

    const vigente = resultado.clave === clave && resultado.intento === intento;
    const recargar = useCallback(() => setIntento((numero) => numero + 1), []);
    // Para reflejar en pantalla el resultado de una acción sin volver a pedir todo.
    const reemplazar = useCallback((cambio) => {
        setResultado((anterior) => ({
            ...anterior,
            datos: typeof cambio === "function" ? cambio(anterior.datos) : cambio
        }));
    }, []);

    return {
        status: vigente ? resultado.status : "loading",
        datos: resultado.datos,
        error: vigente ? resultado.error : null,
        recargar,
        reemplazar
    };
}
