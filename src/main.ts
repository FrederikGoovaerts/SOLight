import Graceful from "node-graceful";
import app from "./api/api";
import db from "./db/DatabaseWrapper";

const port = 8080;

const server = app.listen(port, () => {
    console.info(
        `Stackoverflow Light backend started at http://localhost:${port}`
    );
});

Graceful.on("exit", async () => {
    console.info("Shutting down: Terminating connections.");
    server.close();
    await db.close();
});
