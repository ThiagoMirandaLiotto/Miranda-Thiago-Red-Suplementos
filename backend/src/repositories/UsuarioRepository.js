import Cliente from "../models/Cliente.js";
import Administrador from "../models/Administrador.js";
import { Rol } from "../enums/Rol.js";

// Clientes y administradores en el mismo arreglo, como en el dominio (los dos extienden Usuario).
export default class UsuarioRepository {
    #usuarios = [];
    #nextId = 1;

    #copiar(usuario) {
        return usuario.rol === Rol.ADMINISTRADOR ? new Administrador(usuario) : new Cliente(usuario);
    }

    findAll() {
        return this.#usuarios.map((usuario) => this.#copiar(usuario));
    }

    findById(id) {
        const usuario = this.#usuarios.find((item) => item.idUsuario === id);
        return usuario ? this.#copiar(usuario) : null;
    }

    // Los emails se guardan en minúsculas: la búsqueda no distingue mayúsculas (RN-07).
    findByEmail(email) {
        const usuario = this.#usuarios.find((item) => item.email === email.toLowerCase());
        return usuario ? this.#copiar(usuario) : null;
    }

    create(data) {
        const usuario = this.#copiar({ ...data, idUsuario: this.#nextId++ });
        this.#usuarios.push(usuario);
        return this.#copiar(usuario);
    }

    update(id, data) {
        const index = this.#usuarios.findIndex((item) => item.idUsuario === id);
        if (index === -1) return null;
        this.#usuarios[index] = this.#copiar({ ...data, idUsuario: id, rol: this.#usuarios[index].rol });
        return this.#copiar(this.#usuarios[index]);
    }
}
