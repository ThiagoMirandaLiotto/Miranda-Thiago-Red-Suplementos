import { useCallback, useEffect, useState } from "react";
import { getProductoById } from "../services/productosService.js";
import { notify } from "../utils/notify.js";

// Mismo criterio que parseId del backend: entero positivo, sin ceros a la izquierda.
const ID_VALIDO = /^[1-9]\d*$/;

// "inicial" son los datos que ya trae quien enlaza (la tarjeta): se muestran enseguida y se actualizan con la API.
export function useProducto(id, inicial = null) {
    const idValido = ID_VALIDO.test(id ?? "");
    const [estado, setEstado] = useState(() => ({
        status: !idValido ? "not-found" : inicial ? "success" : "loading",
        producto: idValido ? inicial : null,
        error: null
    }));
    const [intento, setIntento] = useState(0);

    useEffect(() => {
        if (!idValido) return undefined;
        const controller = new AbortController();
        getProductoById(id, controller.signal)
            .then((producto) => setEstado({ status: "success", producto, error: null }))
            .catch((error) => {
                if (controller.signal.aborted) return;
                // Si ya se mostraba el producto y solo falló la actualización, se sigue mostrando.
                setEstado((anterior) => (anterior.producto && error.status !== 404
                    ? anterior
                    : { status: error.status === 404 ? "not-found" : "error", producto: null, error }));
                notify.error(error, { id: `carga-producto-${id}` });
            });
        return () => controller.abort();
    }, [id, idValido, intento]);

    const recargar = useCallback(() => {
        setEstado((anterior) => ({ ...anterior, status: "loading", error: null }));
        setIntento((numero) => numero + 1);
    }, []);

    return { ...estado, recargar };
}
