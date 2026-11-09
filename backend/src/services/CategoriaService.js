export default class CategoriaService {
    constructor(categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    getAll() {
        return this.categoriaRepository.findAll().filter((categoria) => categoria.activa);
    }
}
