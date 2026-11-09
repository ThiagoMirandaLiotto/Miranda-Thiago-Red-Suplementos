import { createApp } from "./app.js";
import { Messages } from "./enums/Messages.js";

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(Messages.INVALID_PORT);
}

createApp().listen(port, "127.0.0.1", () => {
    console.log(`${Messages.SERVER_STARTED} ${port}.`);
}).on("error", (error) => {
    console.error(Messages.SERVER_START_ERROR, error.message);
    process.exitCode = 1;
});
