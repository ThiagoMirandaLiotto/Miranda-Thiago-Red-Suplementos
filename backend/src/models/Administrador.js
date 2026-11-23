import Usuario from "./Usuario.js";
import { Rol } from "../enums/Rol.js";

// El dueño del local: gestiona catálogo, stock, pedidos y reportes.
export default class Administrador extends Usuario {
    constructor({ fechaUltimoAcceso = null, ...datos }) {
        super({ ...datos, rol: Rol.ADMINISTRADOR });
        this.fechaUltimoAcceso = fechaUltimoAcceso;
    }
}
