/**
 * @vitest-environment node
 */
import { AUTH_SECURITY_CONSTANTS, getAuthOptions } from "@/lib/auth/config";
import { beforeEach, describe, expect, it } from "vitest";

describe("auth security configuration", () => {
	beforeEach(() => {
		process.env.BETTER_AUTH_SECRET =
			"test-secret-that-is-at-least-32-characters-long";
		process.env.BETTER_AUTH_URL = "http://localhost:3000";
	});
	it("sets httpOnly and sameSite cookie defaults", () => {
		const options = getAuthOptions({});

		expect(options.advanced?.defaultCookieAttributes).toMatchObject({
			httpOnly: true,
			sameSite: "lax",
		});
	});

	it("rate limits sign in and sign up endpoints", () => {
		const options = getAuthOptions({});

		expect(options.rateLimit?.customRules).toMatchObject({
			"/sign-in/email": {
				window: AUTH_SECURITY_CONSTANTS.RATE_LIMIT_WINDOW_SECONDS,
				max: AUTH_SECURITY_CONSTANTS.RATE_LIMIT_MAX_REQUESTS,
			},
			"/sign-up/email": {
				window: AUTH_SECURITY_CONSTANTS.RATE_LIMIT_WINDOW_SECONDS,
				max: AUTH_SECURITY_CONSTANTS.RATE_LIMIT_MAX_REQUESTS,
			},
		});
	});

	it("uses a seven-day sliding session policy", () => {
		const options = getAuthOptions({});

		expect(options.session).toMatchObject({
			expiresIn: AUTH_SECURITY_CONSTANTS.SESSION_EXPIRES_IN_SECONDS,
			updateAge: AUTH_SECURITY_CONSTANTS.SESSION_UPDATE_AGE_SECONDS,
		});
	});
});
