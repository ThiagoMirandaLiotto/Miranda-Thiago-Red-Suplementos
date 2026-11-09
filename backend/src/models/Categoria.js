export default class Categoria {
    constructor({ idCategoria, nombre, descripcion = "", activa = true }) {
        this.idCategoria = idCategoria;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.activa = activa;
    }
}
