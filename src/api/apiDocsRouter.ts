import fs from "fs";
import path from "path";
import express from "express";
import swaggerUi from "swagger-ui-express";

const swaggerDocument = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../../openapi.json"), "utf-8")
);

const router = express.Router();

router.use("/api-docs", swaggerUi.serve);
router.get("/api-docs", swaggerUi.setup(swaggerDocument));

export default router;
