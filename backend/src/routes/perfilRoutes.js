import { Router } from "express";
import requireJson from "../middlewares/requireJson.js";
import methodNotAllowed from "../middlewares/methodNotAllowed.js";

// Datos personales del cliente con sesión iniciada.
export default function perfilRoutes(controller, { autenticar, soloCliente }) {
    const router = Router();
    router.route("/")
        .get(autenticar, soloCliente, controller.getSession)
        .put(autenticar, soloCliente, requireJson, controller.updateProfile)
        .all(methodNotAllowed("GET, HEAD, PUT"));
    return router;
}
