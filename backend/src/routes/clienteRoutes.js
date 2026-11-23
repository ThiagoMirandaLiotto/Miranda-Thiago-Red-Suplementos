import { Router } from "express";
import requireJson from "../middlewares/requireJson.js";
import methodNotAllowed from "../middlewares/methodNotAllowed.js";

export default function clienteRoutes(controller, { autenticar, soloAdmin }) {
    const router = Router();
    router.use(autenticar, soloAdmin);
    router.route("/")
        .get(controller.getAll)
        .all(methodNotAllowed("GET, HEAD"));
    router.route("/:id/membresia")
        .patch(requireJson, controller.setMembership)
        .all(methodNotAllowed("PATCH"));
    return router;
}
