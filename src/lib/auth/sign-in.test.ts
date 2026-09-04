/**
 * @vitest-environment node
 */
import { AUTH_MESSAGES } from "@/lib/auth/messages";
import { createSignInDependencies } from "@/lib/auth/sign-in-deps";
import { signInUser } from "@/lib/auth/sign-in";
import { createTestAuthEnvironment } from "@/lib/auth/test-utils";
import { describe, expect, it } from "vitest";

const validSignUp = {
	fullName: "Jane Doe",
	email: "jane@example.com",
	password: "Password1!",
	confirmPassword: "Password1!",
};

describe("user sign in", () => {
	it("rejects wrong password for an existing user", async () => {
		const { auth, registerTestUser } = await createTestAuthEnvironment();
		await registerTestUser();

		const result = await signInUser(
			{ email: validSignUp.email, password: "WrongPass1!" },
			createSignInDependencies(auth),
		);

		expect(result).toEqual({
			success: false,
			formError: AUTH_MESSAGES.signIn.invalidCredentials,
		});
	});

	it("rejects non-existent email with a generic error message", async () => {
		const { auth } = await createTestAuthEnvironment();

		const result = await signInUser(
			{ email: "missing@example.com", password: "Password1!" },
			createSignInDependencies(auth),
		);

		expect(result).toEqual({
			success: false,
			formError: AUTH_MESSAGES.signIn.invalidCredentials,
		});
	});

	it("accepts valid credentials and creates a session", async () => {
		const { registerTestUser, signInWithCredentials } =
			await createTestAuthEnvironment();
		await registerTestUser();

		const { headers, response } = await signInWithCredentials(
			validSignUp.email,
			validSignUp.password,
		);

		expect(response.status).toBe(200);
		expect(headers.get("cookie")).toContain("better-auth.session_token");
	});

	it("redirects to dashboard after successful sign in", async () => {
		const { auth, registerTestUser } = await createTestAuthEnvironment();
		await registerTestUser();

		const result = await signInUser(
			{ email: validSignUp.email, password: validSignUp.password },
			createSignInDependencies(auth),
		);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.session.email).toBe(validSignUp.email);
		}
	});
});
