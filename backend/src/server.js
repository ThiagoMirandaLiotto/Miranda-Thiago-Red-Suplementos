import { createApp } from "./app.js";
import { Messages } from "./enums/Messages.js";
import { cargarDatosDemo } from "./data/datosDemo.js";

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(Messages.INVALID_PORT);
}

const app = createApp();

// Los datos viven en memoria: sin esto, cada reinicio arranca con el catálogo vacío.
if (process.env.DATOS_DEMO !== "no") {
    cargarDatosDemo(app.locals.servicios, app.locals.reloj, app.locals.admin);
    console.log(Messages.DEMO_DATA_LOADED);
}

// RN-06: cada minuto vence los pedidos que pasaron 48 h sin retirarse, aunque nadie consulte la API.
setInterval(() => {
    try {
        app.locals.servicios.pedidoService.expireOverdue();
    } catch (error) {
        console.error(error);
    }
}, 60_000).unref();

app.listen(port, "127.0.0.1", () => {
    console.log(`${Messages.SERVER_STARTED} ${port}.`);
}).on("error", (error) => {
    console.error(Messages.SERVER_START_ERROR, error.message);
    process.exitCode = 1;
});
