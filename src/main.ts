import { startApi } from "./api/api";
import { db } from "./db/DatabaseWrapper";

async function main() {
    await db.connect();
    startApi();
}

main();
