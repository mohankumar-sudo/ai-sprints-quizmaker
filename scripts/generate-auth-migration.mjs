import { writeFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { betterAuth } from "better-auth";
import { getMigrations } from "better-auth/db/migration";

const db = new DatabaseSync(":memory:");
const auth = betterAuth({
	database: db,
	emailAndPassword: { enabled: true },
	secret: "x".repeat(32),
	baseURL: "http://localhost:3000",
});

const { runMigrations } = await getMigrations({
	...auth.options,
	database: db,
});
await runMigrations();

const tables = db
	.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' ORDER BY name")
	.all();

const sql = tables.map((table) => `${table.sql};`).join("\n\n");
writeFileSync("d1/migrations/0001_better_auth.sql", `${sql}\n`);
console.log("Wrote d1/migrations/0001_better_auth.sql");
