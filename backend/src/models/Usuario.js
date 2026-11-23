import { Rol } from "../enums/Rol.js";

// Clase base de Cliente y Administrador (dominio de la Entrega 1).
// "contrasena" guarda el hash, nunca el texto, y no sale en las respuestas de la API.
export default class Usuario {
    constructor({ idUsuario, nombre, apellido, email, contrasena, telefono = "",
        fechaAlta, activo = true, rol }) {
        this.idUsuario = idUsuario;
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.contrasena = contrasena;
        this.telefono = telefono;
        this.fechaAlta = fechaAlta;
        this.activo = activo;
        this.rol = rol;
    }

    nombreCompleto() {
        return `${this.nombre} ${this.apellido}`;
    }

    esAdministrador() {
        return this.rol === Rol.ADMINISTRADOR;
    }

    toJSON() {
        const publico = { ...this };
        delete publico.contrasena;
        return publico;
    }
}
