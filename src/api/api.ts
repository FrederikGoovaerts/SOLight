import express from "express";
import questionRouter from "./questionRouter";
import metricsRouter from "./metricsRouter";
import apiDocsRouter from "./apiDocsRouter";
const port = 8080;
const app = express();

app.use(express.json());
app.use(questionRouter);
app.use(metricsRouter);
app.use(apiDocsRouter);

export function startApi(): void {
    app.listen(port, () => {
        console.log(
            `Stackoverflow Light backend started at http://localhost:${port}`
        );
    });
}
