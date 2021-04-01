import express from "express";
import { db } from "../db/DatabaseWrapper";

const router = express.Router();

router.get("/metrics/dow", async (req, res) => {
    const dow = await db.getPopularDay();
    res.send(dow);
});

router.get("/metrics/totals", async (req, res) => {
    const dow = await db.getTotals();
    res.send(dow);
});

router.get("/metrics/averages", async (req, res) => {
    const dow = await db.getAverages();
    res.send(dow);
});

export default router;
