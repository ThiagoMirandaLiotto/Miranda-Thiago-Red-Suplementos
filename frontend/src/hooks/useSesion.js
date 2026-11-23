import { use } from "react";
import { SesionContext } from "../context/sesion.js";

export function useSesion() {
    const sesion = use(SesionContext);
    if (!sesion) throw new Error("useSesion se usa dentro de SesionProvider.");
    return sesion;
}
