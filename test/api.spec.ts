import request, { Response } from "supertest";
import app from "../src/api/api";
import db from "../src/db/DatabaseWrapper";
import { invalidJwt, validJwt } from "./setup/fixtures";

jest.mock("../src/db/DatabaseWrapper");

describe("The health endpoint", () => {
    it("should return a 200 status", async () => {
        const response = await request(app).get("/health");
        expect(response.status).toBe(200);
    });
});

describe("The /questions endpoint", () => {
    describe("when using GET", () => {
        const testResult = ["dummy1", "dummy2"];

        let response: Response;
        beforeEach(async () => {
            db.getListQuestions = jest.fn().mockReturnValue(testResult);

            response = await request(app).get("/questions");
        });

        it("should return the list from the database", async () => {
            expect(response.body).toEqual(testResult);
        });
    });

    describe("when using POST", () => {
        describe("with an invalid JWT", () => {
            let response: Response;
            beforeEach(async () => {
                response = await request(app)
                    .post("/questions")
                    .send({
                        content:
                            "What is the airspeed velocity of an unladen swallow?"
                    })
                    .set("Content-Type", "application/json")
                    .set("Authorization", `Bearer ${invalidJwt}`);
            });

            it("should return a 401 status", () => {
                expect(response.status).toBe(401);
            });
        });
        describe("with a valid JWT", () => {
            const questionContent =
                "What is the airspeed velocity of an unladen swallow?";

            let response: Response;
            beforeEach(async () => {
                db.createQuestion = jest.fn();

                response = await request(app)
                    .post("/questions")
                    .send({
                        content: questionContent
                    })
                    .set("Content-Type", "application/json")
                    .set("Authorization", `Bearer ${validJwt}`);
            });

            it("should return a 200 status", () => {
                expect(response.status).toBe(200);
            });

            it("should call the database wrapper to persiste the question", () => {
                expect(db.createQuestion).toHaveBeenCalledTimes(1);
                expect(db.createQuestion).toHaveBeenCalledWith(questionContent);
            });
        });
    });
});
