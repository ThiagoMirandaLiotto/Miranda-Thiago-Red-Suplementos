import Usuario from "./Usuario.js";

class Administrador extends Usuario {
    constructor(idUsuario, nombre, apellido, email, contrasena, telefono, fechaAlta, activo, rol, fechaUltimoAcceso) {
        super(idUsuario, nombre, apellido, email, contrasena, telefono, fechaAlta, activo);
        this.rol = rol;
        this.fechaUltimoAcceso = fechaUltimoAcceso;
    }
}

export default Administrador;
