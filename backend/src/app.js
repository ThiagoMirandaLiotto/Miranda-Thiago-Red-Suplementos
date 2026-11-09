import express from "express";
import ProductoRepository from "./repositories/ProductoRepository.js";
import CategoriaRepository from "./repositories/CategoriaRepository.js";
import ProductoService from "./services/ProductoService.js";
import CategoriaService from "./services/CategoriaService.js";
import ProductoController from "./controllers/ProductoController.js";
import CategoriaController from "./controllers/CategoriaController.js";
import productoRoutes from "./routes/productoRoutes.js";
import categoriaRoutes from "./routes/categoriaRoutes.js";
import notFoundHandler from "./middlewares/notFoundHandler.js";
import errorHandler from "./middlewares/errorHandler.js";

// Cada instancia mantiene sus propios arrays, compartidos durante su ejecución.
export function createApp() {
    const app = express();
    const productoRepository = new ProductoRepository();
    const categoriaRepository = new CategoriaRepository();
    const productoService = new ProductoService(productoRepository, categoriaRepository);
    const categoriaService = new CategoriaService(categoriaRepository);

    app.disable("x-powered-by");
    app.set("etag", false);
    app.use(express.json({ limit: "100kb", inflate: false }));
    app.use("/api/productos", productoRoutes(new ProductoController(productoService)));
    app.use("/api/categorias", categoriaRoutes(new CategoriaController(categoriaService)));
    app.use(notFoundHandler);
    app.use(errorHandler);
    return app;
}

export default createApp;
