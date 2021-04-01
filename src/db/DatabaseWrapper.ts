import { Client } from "pg";
import { v4 as uuidv4 } from "uuid";

export interface ListQuestion {
    id: string;
    content: string;
    score: number;
    answercount: number;
}

export interface QuestionDetails {
    id: string;
    content: string;
    score: number;
    answers: { id: string; content: string }[];
}

export class DatabaseWrapper {
    private client: Client;
    private connected: boolean;

    constructor() {
        this.client = new Client();
        this.connected = false;
    }

    private checkConnected() {
        if (!this.connected) {
            throw new Error("Not connected to the database!");
        }
    }

    async createQuestion(content: string): Promise<void> {
        this.checkConnected();
        const id = uuidv4();
        await this.client.query(
            "INSERT INTO question(id, content, score) VALUES($1, $2, 0)",
            [id, content]
        );
    }

    async createAnswer(questionId: string, content: string): Promise<void> {
        this.checkConnected();
        const id = uuidv4();
        await this.client.query(
            "INSERT INTO answer(id, question_id, content) VALUES($1, $2, $3)",
            [id, questionId, content]
        );
    }

    async getListQuestions(): Promise<Array<ListQuestion>> {
        this.checkConnected();
        const res = await this.client.query(
            "SELECT question.*, count(answer) as answercount " +
                "FROM question LEFT JOIN answer ON (answer.question_id = question.id) " +
                "GROUP BY question.id " +
                "ORDER BY (count(answer) + question.score) DESC"
        );
        return res.rows.map(
            (entry: ListQuestion & { answerCount: string }) => ({
                ...entry,
                answercount: Number(entry.answercount)
            })
        );
    }

    async getQuestionDetails(questionId: string): Promise<QuestionDetails> {
        const question = (
            await this.client.query(
                "SELECT * FROM question WHERE question.id = $1",
                [questionId]
            )
        ).rows[0];
        const answers = (
            await this.client.query(
                "SELECT * FROM answer WHERE answer.question_id = $1",
                [questionId]
            )
        ).rows;
        return {
            id: question.id,
            content: question.content,
            score: question.score,
            answers: answers.map((answer: { id: string; content: string }) => ({
                id: answer.id,
                content: answer.content
            }))
        };
    }

    async changeScore(questionId: string, change: number): Promise<void> {
        await this.client.query(
            "UPDATE question SET score = score + $1 WHERE question.id = $2",
            [change, questionId]
        );
    }

    async connect(): Promise<void> {
        await this.client.connect();
        this.connected = true;
    }
}

export const db = new DatabaseWrapper();