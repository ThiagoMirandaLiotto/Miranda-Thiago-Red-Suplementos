import { toast } from "sonner";

const MENSAJE_GENERICO = "Algo salió mal. Volvé a intentar en unos segundos.";

export function mensajeDeError(error) {
    if (typeof error === "string") return error;
    return error?.message || MENSAJE_GENERICO;
}

// Único sistema de avisos de la app: éxitos, errores e información pasan por acá.
export const notify = {
    success(mensaje, opciones = {}) {
        return toast.success(mensaje, opciones);
    },
    info(mensaje, opciones = {}) {
        return toast.info(mensaje, opciones);
    },
    error(error, opciones = {}) {
        // Sin conexión, todas las cargas fallan juntas: un solo aviso alcanza.
        const id = error?.status === 0 ? "sin-conexion" : opciones.id;
        return toast.error(mensajeDeError(error), {
            duration: 8000,
            closeButton: true,
            ...opciones,
            id
        });
    }
};
