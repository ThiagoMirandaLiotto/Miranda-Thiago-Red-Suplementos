import { useCallback, useEffect, useState } from "react";
import { getProductos } from "../services/productosService.js";
import { notify } from "../utils/notify.js";

export function useProductos() {
    const [estado, setEstado] = useState({ status: "loading", productos: [], error: null });
    const [intento, setIntento] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        getProductos(controller.signal)
            .then((productos) => setEstado({ status: "success", productos, error: null }))
            .catch((error) => {
                // StrictMode monta dos veces: la primera carga se cancela sin avisar.
                if (controller.signal.aborted) return;
                setEstado({ status: "error", productos: [], error });
                notify.error(error, { id: "carga-productos" });
            });
        return () => controller.abort();
    }, [intento]);

    const recargar = useCallback(() => {
        setEstado((anterior) => ({ ...anterior, status: "loading", error: null }));
        setIntento((numero) => numero + 1);
    }, []);

    const quitarProducto = useCallback((idProducto) => {
        setEstado((anterior) => ({
            ...anterior,
            productos: anterior.productos.filter((producto) => producto.idProducto !== idProducto)
        }));
    }, []);

    return { ...estado, recargar, quitarProducto };
}
