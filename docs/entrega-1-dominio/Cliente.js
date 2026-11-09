import Usuario from "./Usuario.js";

class Cliente extends Usuario {
    constructor(idUsuario, nombre, apellido, email, contrasena, telefono, fechaAlta, activo, esSocioGym, membresiaActiva, descuento) {
        super(idUsuario, nombre, apellido, email, contrasena, telefono, fechaAlta, activo);
        this.esSocioGym = esSocioGym;
        this.membresiaActiva = membresiaActiva;
        this.descuento = descuento;
    }
}

export default Cliente;
