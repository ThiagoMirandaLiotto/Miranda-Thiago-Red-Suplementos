import { Router } from "express";
import requireJson from "../middlewares/requireJson.js";
import methodNotAllowed from "../middlewares/methodNotAllowed.js";

export default function productoRoutes(controller) {
    const router = Router();
    router.route("/")
        .get(controller.getAll)
        .post(requireJson, controller.create)
        .all(methodNotAllowed("GET, HEAD, POST"));
    router.route("/:id")
        .get(controller.getById)
        .put(requireJson, controller.update)
        .delete(controller.delete)
        .all(methodNotAllowed("GET, HEAD, PUT, DELETE"));
    return router;
}
