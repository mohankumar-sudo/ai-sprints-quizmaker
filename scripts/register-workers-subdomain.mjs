import fs from "node:fs";
import path from "node:path";

const configPath = path.join(
	process.env.APPDATA ?? "",
	"xdg.config",
	".wrangler",
	"config",
	"default.toml",
);
const config = fs.readFileSync(configPath, "utf8");
const token = config.match(/oauth_token = "([^"]+)"/)?.[1];

if (!token) {
	console.error("Could not read Wrangler OAuth token. Run `npx wrangler login` first.");
	process.exit(1);
}

const accountId = "168034928a2d9333381bf358ebf7f282";
const subdomain = process.argv[2] ?? "excelsoft-quizmaker";

const response = await fetch(
	`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/subdomain`,
	{
		method: "PUT",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ subdomain }),
	},
);

const json = await response.json();

if (!json.success) {
	console.error(
		"Failed to register workers.dev subdomain:",
		json.errors?.[0]?.message ?? "unknown error",
	);
	process.exit(1);
}

const workersDevSubdomain = json.result.subdomain;
const workerUrl = `https://ai-sprints-quizmaker.${workersDevSubdomain}.workers.dev`;

console.log(`Registered workers.dev subdomain: ${workersDevSubdomain}`);
console.log(`App URL: ${workerUrl}`);
