import { DatabaseSync } from "node:sqlite";
import { betterAuth } from "better-auth";
import { getMigrations } from "better-auth/db/migration";
import { parseSetCookieHeader } from "better-auth/cookies/utils";

import { getAuthOptions } from "@/lib/auth/config";
import type { AuthInstance } from "@/lib/auth/registration";
import { createRegistrationDependencies } from "@/lib/auth/registration-deps";
import { registerUser } from "@/lib/auth/registration";

const validSignUp = {
	fullName: "Jane Doe",
	email: "jane@example.com",
	password: "Password1!",
	confirmPassword: "Password1!",
};

export async function createTestAuthEnvironment() {
	const database = new DatabaseSync(":memory:");

	process.env.BETTER_AUTH_SECRET =
		"test-secret-that-is-at-least-32-characters-long";
	process.env.BETTER_AUTH_URL = "http://localhost:3000";

	const auth = betterAuth({
		...getAuthOptions(database),
		plugins: [],
		rateLimit: { enabled: false },
	});

	const { runMigrations } = await getMigrations({
		...auth.options,
		database,
	});
	await runMigrations();

	const checkEmailExists = async (email: string) => {
		const row = database
			.prepare("SELECT id FROM user WHERE email = ?1 LIMIT 1")
			.get(email);

		return row != null;
	};

	const dependencies = createRegistrationDependencies(
		auth as AuthInstance,
		checkEmailExists,
	);

	const registerTestUser = async (
		input = validSignUp,
	) => {
		const result = await registerUser(input, dependencies);
		if (!result.success) {
			throw new Error("Failed to register test user");
		}
	};

	const signInWithCredentials = async (email: string, password: string) => {
		const response = await auth.handler(
			new Request("http://localhost:3000/api/auth/sign-in/email", {
				method: "POST",
				headers: {
					"content-type": "application/json",
					host: "localhost:3000",
				},
				body: JSON.stringify({ email, password }),
			}),
		);

		const setCookie = response.headers.get("set-cookie") ?? "";
		const parsed = parseSetCookieHeader(setCookie);
		const cookieName = parsed.has("__Secure-better-auth.session_token")
			? "__Secure-better-auth.session_token"
			: "better-auth.session_token";
		const sessionCookie = parsed.get(cookieName);
		const headers = new Headers();

		if (sessionCookie?.value) {
			headers.set("cookie", `${cookieName}=${sessionCookie.value}`);
		}

		return { headers, response };
	};

	return {
		auth: auth as AuthInstance,
		database,
		dependencies,
		validSignUp,
		registerTestUser,
		signInWithCredentials,
		getCredentialPasswordHash: (email: string) => {
			const row = database
				.prepare(
					`SELECT a.password AS password
					 FROM account a
					 INNER JOIN user u ON u.id = a.userId
					 WHERE u.email = ?1 AND a.providerId = 'credential'
					 LIMIT 1`,
				)
				.get(email) as { password: string | null } | undefined;

			return row?.password ?? null;
		},
	};
}

export const createTestRegistrationDependencies = createTestAuthEnvironment;
