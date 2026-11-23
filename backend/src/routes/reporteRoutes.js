import { Router } from "express";
import methodNotAllowed from "../middlewares/methodNotAllowed.js";

// F-08, solo para el administrador (RN-10). Período con ?desde=AAAA-MM-DD&hasta=AAAA-MM-DD.
export default function reporteRoutes(controller, { autenticar, soloAdmin }) {
    const router = Router();
    router.use(autenticar, soloAdmin);
    for (const [ruta, accion] of [
        ["/ventas", controller.getVentas],
        ["/mas-vendidos", controller.getMasVendidos],
        ["/cancelados", controller.getCancelados],
        ["/stock-critico", controller.getStockCritico]
    ]) {
        router.route(ruta).get(accion).all(methodNotAllowed("GET, HEAD"));
    }
    return router;
}
