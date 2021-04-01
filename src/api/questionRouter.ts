import express from "express";
import { OpenidRequest, requiresAuth } from "express-openid-connect";
import { db } from "../db/DatabaseWrapper";

const router = express.Router();

router.get("/questions", async (req, res) => {
    const questions = await db.getListQuestions();
    res.send(questions);
});

router.get("/questions/:id", async (req, res) => {
    const id = req.params.id;
    const question = await db.getQuestionDetails(id);
    res.send(question);
});

router.post("/questions", requiresAuth(), async (req, res) => {
    if (req.body?.content == undefined) {
        res.sendStatus(400);
        return;
    }
    await db.createQuestion(req.body.content);
    res.sendStatus(200);

    const { oidc } = req as OpenidRequest;
    if (oidc.user && (oidc.user as Record<string, string>).sub) {
        void db.addActiveUser((oidc.user as Record<string, string>).sub);
    }
});

router.post("/questions/:id/answers", requiresAuth(), async (req, res) => {
    const questionId = req.params.id;
    if (req.body?.content === undefined) {
        res.sendStatus(400);
        return;
    }
    await db.createAnswer(questionId, req.body.content);
    res.sendStatus(200);

    const { oidc } = req as OpenidRequest;
    if (oidc.user && (oidc.user as Record<string, string>).sub) {
        void db.addActiveUser((oidc.user as Record<string, string>).sub);
    }
});

router.post("/questions/:id/upvote", async (req, res) => {
    const id = req.params.id;
    await db.changeScore(id, 1);
    res.sendStatus(200);
});

router.post("/questions/:id/downvote", async (req, res) => {
    const id = req.params.id;
    await db.changeScore(id, -1);
    res.sendStatus(200);
});

export default router;
