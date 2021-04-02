import express from "express";
import questionRouter from "./questionRouter";
import metricsRouter from "./metricsRouter";
import apiDocsRouter from "./apiDocsRouter";

const app = express();

app.use(express.json());
app.use(questionRouter);
app.use(metricsRouter);
app.use(apiDocsRouter);

app.get("/health", (req, res) => {
    res.sendStatus(200);
});

export default app;
