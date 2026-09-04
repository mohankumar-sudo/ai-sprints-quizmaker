import { AUTH_MESSAGES } from "@/lib/auth/messages";
import { validateSignIn, validateSignUp } from "@/lib/auth/validation";
import { describe, expect, it } from "vitest";

const validSignUp = {
	fullName: "Jane Doe",
	email: "jane@example.com",
	password: "Password1!",
	confirmPassword: "Password1!",
};

const validSignIn = {
	email: "jane@example.com",
	password: "any-password",
};

describe("sign up validation", () => {
	it("rejects empty full name", () => {
		const result = validateSignUp({ ...validSignUp, fullName: "" });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.fullName).toBe(AUTH_MESSAGES.fullName.required);
		}
	});

	it("rejects whitespace-only full name", () => {
		const result = validateSignUp({ ...validSignUp, fullName: "   " });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.fullName).toBe(AUTH_MESSAGES.fullName.required);
		}
	});

	it("rejects full name shorter than 2 characters", () => {
		const result = validateSignUp({ ...validSignUp, fullName: "A" });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.fullName).toBe(AUTH_MESSAGES.fullName.tooShort);
		}
	});

	it("rejects full name longer than 100 characters", () => {
		const result = validateSignUp({
			...validSignUp,
			fullName: "A".repeat(101),
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.fullName).toBe(AUTH_MESSAGES.fullName.tooLong);
		}
	});

	it("rejects empty email", () => {
		const result = validateSignUp({ ...validSignUp, email: "" });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.email).toBe(AUTH_MESSAGES.email.required);
		}
	});

	it("rejects invalid email format", () => {
		const result = validateSignUp({ ...validSignUp, email: "not-an-email" });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.email).toBe(AUTH_MESSAGES.email.invalid);
		}
	});

	it("rejects empty password", () => {
		const result = validateSignUp({
			...validSignUp,
			password: "",
			confirmPassword: "",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.password).toBe(AUTH_MESSAGES.password.required);
		}
	});

	it("rejects password shorter than 8 characters", () => {
		const result = validateSignUp({
			...validSignUp,
			password: "Ab1!",
			confirmPassword: "Ab1!",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.password).toBe(AUTH_MESSAGES.password.tooShort);
		}
	});

	it("rejects password missing uppercase letter", () => {
		const result = validateSignUp({
			...validSignUp,
			password: "password1!",
			confirmPassword: "password1!",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.password).toBe(
				AUTH_MESSAGES.password.missingUppercase,
			);
		}
	});

	it("rejects password missing lowercase letter", () => {
		const result = validateSignUp({
			...validSignUp,
			password: "PASSWORD1!",
			confirmPassword: "PASSWORD1!",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.password).toBe(
				AUTH_MESSAGES.password.missingLowercase,
			);
		}
	});

	it("rejects password missing number", () => {
		const result = validateSignUp({
			...validSignUp,
			password: "Password!",
			confirmPassword: "Password!",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.password).toBe(AUTH_MESSAGES.password.missingNumber);
		}
	});

	it("rejects password missing special character", () => {
		const result = validateSignUp({
			...validSignUp,
			password: "Password1",
			confirmPassword: "Password1",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.password).toBe(
				AUTH_MESSAGES.password.missingSpecial,
			);
		}
	});

	it("rejects empty confirm password", () => {
		const result = validateSignUp({
			...validSignUp,
			confirmPassword: "",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.confirmPassword).toBe(
				AUTH_MESSAGES.confirmPassword.required,
			);
		}
	});

	it("rejects confirm password that does not match password", () => {
		const result = validateSignUp({
			...validSignUp,
			confirmPassword: "Password2!",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.confirmPassword).toBe(
				AUTH_MESSAGES.confirmPassword.mismatch,
			);
		}
	});

	it("accepts valid sign up input", () => {
		const result = validateSignUp({
			...validSignUp,
			fullName: "  Jane Doe  ",
			email: "  JANE@Example.COM  ",
		});

		expect(result).toEqual({
			success: true,
			data: {
				fullName: "Jane Doe",
				email: "jane@example.com",
				password: validSignUp.password,
				confirmPassword: validSignUp.confirmPassword,
			},
		});
	});
});

describe("sign in validation", () => {
	it("rejects empty email", () => {
		const result = validateSignIn({ ...validSignIn, email: "" });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.email).toBe(AUTH_MESSAGES.email.required);
		}
	});

	it("rejects invalid email format", () => {
		const result = validateSignIn({ ...validSignIn, email: "not-an-email" });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.email).toBe(AUTH_MESSAGES.email.invalid);
		}
	});

	it("rejects empty password", () => {
		const result = validateSignIn({ ...validSignIn, password: "" });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.password).toBe(AUTH_MESSAGES.password.required);
		}
	});

	it("accepts valid sign in input without password complexity checks", () => {
		const result = validateSignIn({
			email: "  JANE@Example.COM  ",
			password: "short",
		});

		expect(result).toEqual({
			success: true,
			data: {
				email: "jane@example.com",
				password: "short",
			},
		});
	});
});
