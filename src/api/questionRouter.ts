import express from "express";
import jwt from "express-jwt";
import db from "../db/DatabaseWrapper";

const jwtMiddleware = jwt({
    secret: process.env.JWT_SECRET ?? "",
    algorithms: [process.env.JWT_ALGO ?? ""]
});
const router = express.Router();

router.get("/questions", async (req, res) => {
    const questions = await db.getListQuestions();
    res.send(questions);
});

router.get("/questions/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const question = await db.getQuestionDetails(id);
        res.send(question);
    } catch (e) {
        res.sendStatus(404);
    }
});

router.post("/questions", jwtMiddleware, async (req, res) => {
    if (req.body?.content == undefined) {
        res.sendStatus(400);
        return;
    }
    await db.createQuestion(req.body.content);
    res.sendStatus(200);

    const { sub } = req.user as { sub: string };
    void db.addActiveUser(sub);
});

router.post("/questions/:id/answers", jwtMiddleware, async (req, res) => {
    const questionId = req.params.id;
    if (req.body?.content === undefined) {
        res.sendStatus(400);
        return;
    }
    await db.createAnswer(questionId, req.body.content);
    res.sendStatus(200);

    const { sub } = req.user as { sub: string };
    void db.addActiveUser(sub);
});

router.post("/questions/:id/upvote", async (req, res) => {
    const id = req.params.id;
    await db.upvote(id);
    res.sendStatus(200);
});

router.post("/questions/:id/downvote", async (req, res) => {
    const id = req.params.id;
    await db.downvote(id);
    res.sendStatus(200);
});

export default router;
