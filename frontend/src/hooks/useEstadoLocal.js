import { useEffect, useState } from "react";
import { estadoDelLocal } from "../utils/horario.js";

// Estado del local según la hora de Buenos Aires; se recalcula cada minuto.
export function useEstadoLocal() {
    const [estado, setEstado] = useState(() => estadoDelLocal());

    useEffect(() => {
        const intervalo = setInterval(() => setEstado(estadoDelLocal()), 60_000);
        return () => clearInterval(intervalo);
    }, []);

    return estado;
}
