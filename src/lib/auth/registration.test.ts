/**
 * @vitest-environment node
 */
import { AUTH_MESSAGES } from "@/lib/auth/messages";
import { registerUser } from "@/lib/auth/registration";
import { createTestRegistrationDependencies } from "@/lib/auth/test-utils";
import { describe, expect, it } from "vitest";

const validSignUp = {
	fullName: "Jane Doe",
	email: "jane@example.com",
	password: "Password1!",
	confirmPassword: "Password1!",
};

describe("user registration", () => {
	it("creates a user record with a hashed password", async () => {
		const { dependencies, getCredentialPasswordHash } =
			await createTestRegistrationDependencies();

		const result = await registerUser(validSignUp, dependencies);

		expect(result).toEqual({ success: true });
		expect(await dependencies.checkEmailExists("jane@example.com")).toBe(true);

		const passwordHash = getCredentialPasswordHash("jane@example.com");
		expect(passwordHash).toBeTruthy();
		expect(passwordHash).not.toBe(validSignUp.password);
	});

	it("rejects duplicate email", async () => {
		const { dependencies } = await createTestRegistrationDependencies();

		await registerUser(validSignUp, dependencies);

		const result = await registerUser(validSignUp, dependencies);

		expect(result).toEqual({
			success: false,
			errors: { email: AUTH_MESSAGES.email.alreadyRegistered },
		});
	});

	it("rejects sign up when validation fails", async () => {
		const { dependencies } = await createTestRegistrationDependencies();

		const result = await registerUser(
			{ ...validSignUp, email: "not-an-email" },
			dependencies,
		);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.email).toBe(AUTH_MESSAGES.email.invalid);
		}

		expect(await dependencies.checkEmailExists("not-an-email")).toBe(false);
	});

	it("does not store plain-text passwords", async () => {
		const { dependencies, getCredentialPasswordHash } =
			await createTestRegistrationDependencies();

		await registerUser(validSignUp, dependencies);

		const passwordHash = getCredentialPasswordHash("jane@example.com");
		expect(passwordHash).not.toBe(validSignUp.password);
		expect(passwordHash?.length).toBeGreaterThan(validSignUp.password.length);
	});
});
