import Categoria from "../models/Categoria.js";

export default class CategoriaRepository {
    #categorias = [
        new Categoria({ idCategoria: 1, nombre: "Proteínas" }),
        new Categoria({ idCategoria: 2, nombre: "Creatina" }),
        new Categoria({ idCategoria: 3, nombre: "Pre-entreno" }),
        new Categoria({ idCategoria: 4, nombre: "Aminoácidos" }),
        new Categoria({ idCategoria: 5, nombre: "Barras proteicas" })
    ];

    findAll() {
        return this.#categorias.map((categoria) => new Categoria(categoria));
    }

    findById(id) {
        const categoria = this.#categorias.find((item) => item.idCategoria === id);
        return categoria ? new Categoria(categoria) : null;
    }
}
