import { Router } from "express";
import requireJson from "../middlewares/requireJson.js";
import methodNotAllowed from "../middlewares/methodNotAllowed.js";

// El carrito lo usa el administrador para registrar los pedidos que le llegan por Instagram.
export default function carritoRoutes(controller, { autenticar, soloAdmin }) {
    const router = Router();
    router.use(autenticar, soloAdmin);
    router.route("/")
        .get(controller.get)
        .delete(controller.clear)
        .all(methodNotAllowed("GET, HEAD, DELETE"));
    router.route("/items")
        .post(requireJson, controller.addItem)
        .all(methodNotAllowed("POST"));
    router.route("/items/:idProducto")
        .patch(requireJson, controller.updateItem)
        .delete(controller.removeItem)
        .all(methodNotAllowed("PATCH, DELETE"));
    return router;
}
