import express from "express";
import ProductoRepository from "./repositories/ProductoRepository.js";
import CategoriaRepository from "./repositories/CategoriaRepository.js";
import UsuarioRepository from "./repositories/UsuarioRepository.js";
import SesionRepository from "./repositories/SesionRepository.js";
import CarritoRepository from "./repositories/CarritoRepository.js";
import PedidoRepository from "./repositories/PedidoRepository.js";
import MovimientoStockRepository from "./repositories/MovimientoStockRepository.js";
import ProductoService from "./services/ProductoService.js";
import CategoriaService from "./services/CategoriaService.js";
import StockService from "./services/StockService.js";
import AuthService from "./services/AuthService.js";
import ClienteService from "./services/ClienteService.js";
import CarritoService from "./services/CarritoService.js";
import PedidoService from "./services/PedidoService.js";
import ReporteService from "./services/ReporteService.js";
import ProductoController from "./controllers/ProductoController.js";
import CategoriaController from "./controllers/CategoriaController.js";
import StockController from "./controllers/StockController.js";
import AuthController from "./controllers/AuthController.js";
import ClienteController from "./controllers/ClienteController.js";
import CarritoController from "./controllers/CarritoController.js";
import PedidoController from "./controllers/PedidoController.js";
import ReporteController from "./controllers/ReporteController.js";
import productoRoutes from "./routes/productoRoutes.js";
import categoriaRoutes from "./routes/categoriaRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import perfilRoutes from "./routes/perfilRoutes.js";
import clienteRoutes from "./routes/clienteRoutes.js";
import carritoRoutes from "./routes/carritoRoutes.js";
import pedidoRoutes from "./routes/pedidoRoutes.js";
import reporteRoutes from "./routes/reporteRoutes.js";
import authenticate from "./middlewares/authenticate.js";
import authorize from "./middlewares/authorize.js";
import notFoundHandler from "./middlewares/notFoundHandler.js";
import errorHandler from "./middlewares/errorHandler.js";
import { Rol } from "./enums/Rol.js";
import { crearReloj } from "./utils/reloj.js";
import { cuentaAdministrador } from "./data/cuentaAdministrador.js";

// Cada instancia mantiene sus propios arrays, compartidos durante su ejecución.
// "reloj" permite fijar la hora en las pruebas; "admin" es la cuenta del dueño que se crea al iniciar.
export function createApp({ reloj = crearReloj(), admin = cuentaAdministrador() } = {}) {
    const app = express();

    // Repositorios: arrays en memoria.
    const productoRepository = new ProductoRepository();
    const categoriaRepository = new CategoriaRepository();
    const usuarioRepository = new UsuarioRepository();
    const sesionRepository = new SesionRepository();
    const carritoRepository = new CarritoRepository();
    const pedidoRepository = new PedidoRepository();
    const movimientoRepository = new MovimientoStockRepository();

    // Servicios: la lógica de negocio.
    const stockService = new StockService(productoRepository, movimientoRepository, reloj);
    const productoService = new ProductoService(productoRepository, categoriaRepository, stockService);
    const categoriaService = new CategoriaService(categoriaRepository);
    const authService = new AuthService(usuarioRepository, sesionRepository, reloj);
    const clienteService = new ClienteService(usuarioRepository, pedidoRepository);
    const carritoService = new CarritoService(carritoRepository, productoRepository, usuarioRepository);
    const pedidoService = new PedidoService({
        pedidoRepository, carritoRepository, productoRepository, usuarioRepository, stockService, carritoService, reloj
    });
    const reporteService = new ReporteService(pedidoRepository, productoRepository, pedidoService, reloj);
    const administrador = authService.ensureAdmin(admin);

    // Control de acceso (RN-02, RN-10).
    const acceso = {
        autenticar: authenticate(authService),
        soloAdmin: authorize(Rol.ADMINISTRADOR),
        soloCliente: authorize(Rol.CLIENTE)
    };
    const authController = new AuthController(authService);

    app.disable("x-powered-by");
    app.set("etag", false);
    app.use(express.json({ limit: "100kb", inflate: false }));
    app.use("/api/auth", authRoutes(authController, acceso));
    app.use("/api/perfil", perfilRoutes(authController, acceso));
    app.use("/api/productos", productoRoutes(new ProductoController(productoService), new StockController(stockService), acceso));
    app.use("/api/categorias", categoriaRoutes(new CategoriaController(categoriaService)));
    app.use("/api/clientes", clienteRoutes(new ClienteController(clienteService), acceso));
    app.use("/api/carrito", carritoRoutes(new CarritoController(carritoService), acceso));
    app.use("/api/pedidos", pedidoRoutes(new PedidoController(pedidoService), acceso));
    app.use("/api/reportes", reporteRoutes(new ReporteController(reporteService), acceso));
    app.use(notFoundHandler);
    app.use(errorHandler);

    // Para server.js: cargar datos de demostración y revisar los pedidos vencidos.
    app.locals.reloj = reloj;
    app.locals.admin = administrador;
    app.locals.servicios = {
        productoService, stockService, authService, clienteService, carritoService, pedidoService
    };
    return app;
}

export default createApp;
