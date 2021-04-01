import { Client } from "pg";
import { v4 as uuidv4 } from "uuid";

export interface ListQuestion {
    id: string;
    content: string;
    upvotes: number;
    downvotes: number;
    answercount: number;
}

export interface QuestionDetails {
    id: string;
    content: string;
    score: number;
    answers: { id: string; content: string }[];
}

export interface TotalMetrics {
    questions: number;
    answers: number;
    votes: number;
}

const dayMap: Record<string, string> = {
    "0": "Sunday",
    "1": "Monday",
    "2": "Tuesday",
    "3": "Wednesday",
    "4": "Thursday",
    "5": "Friday",
    "6": "Saturday"
};

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

    // Question and answer calls

    async createQuestion(content: string): Promise<void> {
        this.checkConnected();
        const id = uuidv4();
        await this.client.query(
            "INSERT INTO question(id, content) VALUES($1, $2)",
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
            "SELECT question.id, question.content, question.upvotes, question.downvotes, count(answer) as answercount " +
                "FROM question LEFT JOIN answer ON (answer.question_id = question.id) " +
                "GROUP BY question.id " +
                "ORDER BY (count(answer) + question.upvotes - question.downvotes) DESC"
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

    async upvote(questionId: string): Promise<void> {
        await this.client.query(
            "UPDATE question SET upvotes = upvotes + 1 WHERE question.id = $1",
            [questionId]
        );
    }

    async downvote(questionId: string): Promise<void> {
        await this.client.query(
            "UPDATE question SET downvotes = downvotes + 1 WHERE question.id = $1",
            [questionId]
        );
    }

    async addActiveUser(subject: string): Promise<void> {
        const result = await this.client.query(
            "SELECT * FROM souser WHERE souser.sub = $1",
            [subject]
        );
        if (result.rowCount > 0) {
            return;
        }
        const id = uuidv4();
        await this.client.query("INSERT INTO souser(id, sub) VALUES($1, $2)", [
            id,
            subject
        ]);
    }

    // Metrics calls

    async getPopularDay(): Promise<string> {
        const result = await this.client.query(
            "SELECT dow, COUNT(dow) FROM ( " +
                "SELECT EXTRACT(DOW FROM question.ts) AS dow FROM question " +
                "UNION ALL " +
                "SELECT EXTRACT(DOW FROM answer.ts) AS dow FROM answer " +
                ") AS dow GROUP BY dow;"
        );
        if (result.rowCount === 0) {
            return "None";
        }
        return dayMap[result.rows[0].dow];
    }

    async connect(): Promise<void> {
        await this.client.connect();
        this.connected = true;
    }
}

export const db = new DatabaseWrapper();
