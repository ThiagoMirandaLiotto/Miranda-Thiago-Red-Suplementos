import { Router } from "express";
import requireJson from "../middlewares/requireJson.js";
import methodNotAllowed from "../middlewares/methodNotAllowed.js";

// Consultar el catálogo es público; modificarlo y mover stock, solo para el administrador (RN-10).
export default function productoRoutes(controller, stockController, { autenticar, soloAdmin }) {
    const router = Router();
    router.route("/")
        .get(controller.getAll)
        .post(autenticar, soloAdmin, requireJson, controller.create)
        .all(methodNotAllowed("GET, HEAD, POST"));
    router.route("/:id")
        .get(controller.getById)
        .put(autenticar, soloAdmin, requireJson, controller.update)
        .delete(autenticar, soloAdmin, controller.delete)
        .all(methodNotAllowed("GET, HEAD, PUT, DELETE"));
    router.route("/:id/movimientos")
        .get(autenticar, soloAdmin, stockController.getMovements)
        .post(autenticar, soloAdmin, requireJson, stockController.createMovement)
        .all(methodNotAllowed("GET, HEAD, POST"));
    return router;
}
