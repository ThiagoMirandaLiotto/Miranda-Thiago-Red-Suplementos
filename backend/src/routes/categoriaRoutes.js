import { Router } from "express";
import methodNotAllowed from "../middlewares/methodNotAllowed.js";

export default function categoriaRoutes(controller) {
    const router = Router();
    router.route("/")
        .get(controller.getAll)
        .all(methodNotAllowed("GET, HEAD"));
    return router;
}
