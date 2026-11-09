import { useCallback, useEffect, useMemo, useState } from "react";
import { getCategorias } from "../services/categoriasService.js";
import { crearMapaCategorias } from "../utils/categorias.js";
import { notify } from "../utils/notify.js";

export function useCategorias() {
    const [estado, setEstado] = useState({ status: "loading", categorias: [], error: null });
    const [intento, setIntento] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        getCategorias(controller.signal)
            .then((categorias) => setEstado({ status: "success", categorias, error: null }))
            .catch((error) => {
                if (controller.signal.aborted) return;
                setEstado({ status: "error", categorias: [], error });
                notify.error(error, { id: "carga-categorias" });
            });
        return () => controller.abort();
    }, [intento]);

    const recargar = useCallback(() => {
        setEstado((anterior) => ({ ...anterior, status: "loading", error: null }));
        setIntento((numero) => numero + 1);
    }, []);

    const mapaCategorias = useMemo(() => crearMapaCategorias(estado.categorias), [estado.categorias]);

    return { ...estado, mapaCategorias, recargar };
}
