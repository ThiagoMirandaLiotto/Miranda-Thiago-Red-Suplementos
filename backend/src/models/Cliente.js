import Usuario from "./Usuario.js";
import { Rol } from "../enums/Rol.js";

// esSocioGym lo declara el cliente; membresiaActiva la confirma el local después de verificarla.
export default class Cliente extends Usuario {
    constructor({ esSocioGym = false, membresiaActiva = false, descuento = 0, ...datos }) {
        super({ ...datos, rol: Rol.CLIENTE });
        this.esSocioGym = esSocioGym;
        this.membresiaActiva = membresiaActiva;
        this.descuento = descuento;
    }

    // RN-09: el descuento corresponde solo a socios con la membresía activa y verificada.
    tieneDescuento() {
        return this.activo && this.esSocioGym && this.membresiaActiva && this.descuento > 0;
    }
}
