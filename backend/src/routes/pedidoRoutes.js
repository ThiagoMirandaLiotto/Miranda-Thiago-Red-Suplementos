import { Router } from "express";
import requireJson from "../middlewares/requireJson.js";
import methodNotAllowed from "../middlewares/methodNotAllowed.js";

// Con sesión: el administrador ve y gestiona todos; el cliente ve los suyos y puede cancelarlos (RN-04).
export default function pedidoRoutes(controller, { autenticar, soloAdmin }) {
    const router = Router();
    router.use(autenticar);
    router.route("/")
        .get(controller.getAll)
        .post(soloAdmin, requireJson, controller.create)
        .all(methodNotAllowed("GET, HEAD, POST"));
    router.route("/:id")
        .get(controller.getById)
        .all(methodNotAllowed("GET, HEAD"));
    router.route("/:id/estado")
        .patch(requireJson, controller.changeStatus)
        .all(methodNotAllowed("PATCH"));
    router.route("/:id/repetir")
        .post(soloAdmin, controller.repeat)
        .all(methodNotAllowed("POST"));
    return router;
}
