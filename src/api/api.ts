import express from "express";
import questionRouter from "./questionRouter";
import metricsRouter from "./metricsRouter";

const port = 8080;
const app = express();

app.use(express.json());
app.use(questionRouter);
app.use(metricsRouter);

export function startApi(): void {
    app.listen(port, () => {
        console.log(
            `Stackoverflow Light backend started at http://localhost:${port}`
        );
    });
}
