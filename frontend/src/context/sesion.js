import { createContext } from "react";

// Sesión de la persona: { status: "cargando" | "invitado" | "autenticado", usuario, ingresar, crearCuenta, salir, actualizarUsuario }.
export const SesionContext = createContext(null);
