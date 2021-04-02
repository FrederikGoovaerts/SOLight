import { Pool } from "pg";
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
    upvotes: number;
    downvotes: number;
    answers: {
        id: string;
        content: string;
        upvotes: number;
        downvotes: number;
    }[];
}

export interface StatMetrics {
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
    private pool: Pool;

    constructor() {
        this.pool = new Pool();
    }

    // Question and answer calls

    async createQuestion(content: string): Promise<void> {
        const id = uuidv4();
        await this.pool.query(
            "INSERT INTO question(id, content) VALUES($1, $2)",
            [id, content]
        );
    }

    async createAnswer(questionId: string, content: string): Promise<void> {
        const id = uuidv4();
        await this.pool.query(
            "INSERT INTO answer(id, question_id, content) VALUES($1, $2, $3)",
            [id, questionId, content]
        );
    }

    async getListQuestions(): Promise<Array<ListQuestion>> {
        const res = await this.pool.query(
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
            await this.pool.query(
                "SELECT * FROM question WHERE question.id = $1",
                [questionId]
            )
        ).rows[0];
        const answers = (
            await this.pool.query(
                "SELECT * FROM answer WHERE answer.question_id = $1",
                [questionId]
            )
        ).rows;
        return {
            id: question.id,
            content: question.content,
            upvotes: question.upvotes,
            downvotes: question.downvotes,
            answers: answers.map(
                (answer: {
                    id: string;
                    content: string;
                    upvotes: number;
                    downvotes: number;
                }) => ({
                    id: answer.id,
                    content: answer.content,
                    upvotes: answer.upvotes,
                    downvotes: answer.downvotes
                })
            )
        };
    }

    async upvoteQuestion(questionId: string): Promise<void> {
        await this.pool.query(
            "UPDATE question SET upvotes = upvotes + 1 WHERE question.id = $1",
            [questionId]
        );
    }

    async downvoteQuestion(questionId: string): Promise<void> {
        await this.pool.query(
            "UPDATE question SET downvotes = downvotes + 1 WHERE question.id = $1",
            [questionId]
        );
    }

    async addActiveUser(subject: string): Promise<void> {
        const result = await this.pool.query(
            "SELECT * FROM souser WHERE souser.sub = $1",
            [subject]
        );
        if (result.rowCount > 0) {
            return;
        }
        const id = uuidv4();
        await this.pool.query("INSERT INTO souser(id, sub) VALUES($1, $2)", [
            id,
            subject
        ]);
    }

    // Metrics calls

    async getPopularDay(): Promise<string> {
        const result = await this.pool.query(
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

    async getTotals(): Promise<StatMetrics> {
        const voteCount = Number(
            (
                await this.pool.query(
                    "SELECT (upvotecount + downvotecount) as result " +
                        "FROM (SELECT SUM(question.upvotes) as upvotecount FROM question) as up, " +
                        "(SELECT SUM(question.downvotes) as downvotecount FROM question) as down;"
                )
            ).rows[0].result
        );
        const questionCount = Number(
            (await this.pool.query("SELECT COUNT(*) FROM question;")).rows[0]
                .count
        );
        const answerCount = Number(
            (await this.pool.query("SELECT COUNT(*) FROM answer;")).rows[0]
                .count
        );
        return {
            votes: voteCount,
            answers: answerCount,
            questions: questionCount
        };
    }

    async getAverages(): Promise<StatMetrics> {
        const userCount = Number(
            (await this.pool.query("SELECT COUNT(*) FROM souser;")).rows[0]
                .count
        );
        const totals = await this.getTotals();
        return {
            votes: totals.votes / userCount,
            answers: totals.answers / userCount,
            questions: totals.questions / userCount
        };
    }
}

const db = new DatabaseWrapper();
export default db;
