import { Router } from "express";
import requireJson from "../middlewares/requireJson.js";
import methodNotAllowed from "../middlewares/methodNotAllowed.js";

// F-01: registro de clientes, inicio y cierre de sesión.
export default function authRoutes(controller, { autenticar }) {
    const router = Router();
    router.route("/registro")
        .post(requireJson, controller.register)
        .all(methodNotAllowed("POST"));
    router.route("/login")
        .post(requireJson, controller.login)
        .all(methodNotAllowed("POST"));
    router.route("/logout")
        .post(autenticar, controller.logout)
        .all(methodNotAllowed("POST"));
    router.route("/sesion")
        .get(autenticar, controller.getSession)
        .all(methodNotAllowed("GET, HEAD"));
    return router;
}
