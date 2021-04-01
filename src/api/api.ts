import express from "express";
import questionRouter from "./questionRouter";
import metadataRouter from "./metadataRouter";

const port = 8080;
const app = express();

app.use(express.json());
app.use(questionRouter);
app.use(metadataRouter);

export function startApi(): void {
    app.listen(port, () => {
        console.log(
            `Stackoverflow Light backend started at http://localhost:${port}`
        );
    });
}
