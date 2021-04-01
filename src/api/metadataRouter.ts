import express from "express";
import { db } from "../db/DatabaseWrapper";

const router = express.Router();

router.get("/metadata/dow", async (req, res) => {
    const dow = await db.getPopularDay();
    res.send(dow);
});

router.get("/metadata/totals", async (req, res) => {
    const dow = await db.getTotals();
    res.send(dow);
});

router.get("/metadata/averages", async (req, res) => {
    const dow = await db.getAverages();
    res.send(dow);
});

export default router;
