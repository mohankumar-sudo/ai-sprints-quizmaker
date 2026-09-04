import type { BetterAuthOptions } from "better-auth";
import { nextCookies } from "better-auth/next-js";

const SESSION_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7;
const SESSION_UPDATE_AGE_SECONDS = 60 * 60 * 24;
const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_REQUESTS = 10;

export type AuthEnv = {
	BETTER_AUTH_SECRET?: string;
	BETTER_AUTH_URL?: string;
};

export function getAuthEnvFromBindings(bindings: unknown): AuthEnv {
	if (!bindings || typeof bindings !== "object") {
		return {};
	}

	const env = bindings as Record<string, string | undefined>;
	return {
		BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET,
		BETTER_AUTH_URL: env.BETTER_AUTH_URL,
	};
}

export function getAuthOptions(
	database: unknown,
	authEnv: AuthEnv = {},
): BetterAuthOptions {
	const secret =
		authEnv.BETTER_AUTH_SECRET ?? process.env.BETTER_AUTH_SECRET;
	const baseURL = authEnv.BETTER_AUTH_URL ?? process.env.BETTER_AUTH_URL;
	const isProduction = process.env.NODE_ENV === "production";

	if (!secret) {
		throw new Error("BETTER_AUTH_SECRET is not configured");
	}

	return {
		database,
		secret,
		baseURL,
		emailAndPassword: {
			enabled: true,
			autoSignIn: false,
		},
		session: {
			expiresIn: SESSION_EXPIRES_IN_SECONDS,
			updateAge: SESSION_UPDATE_AGE_SECONDS,
		},
		rateLimit: {
			enabled: isProduction,
			window: RATE_LIMIT_WINDOW_SECONDS,
			max: RATE_LIMIT_MAX_REQUESTS,
			customRules: {
				"/sign-in/email": {
					window: RATE_LIMIT_WINDOW_SECONDS,
					max: RATE_LIMIT_MAX_REQUESTS,
				},
				"/sign-up/email": {
					window: RATE_LIMIT_WINDOW_SECONDS,
					max: RATE_LIMIT_MAX_REQUESTS,
				},
			},
		},
		advanced: {
			useSecureCookies: isProduction,
			defaultCookieAttributes: {
				httpOnly: true,
				sameSite: "lax",
				secure: isProduction,
			},
		},
		plugins: [nextCookies()],
	};
}

export const AUTH_SECURITY_CONSTANTS = {
	SESSION_EXPIRES_IN_SECONDS,
	SESSION_UPDATE_AGE_SECONDS,
	RATE_LIMIT_WINDOW_SECONDS,
	RATE_LIMIT_MAX_REQUESTS,
} as const;
