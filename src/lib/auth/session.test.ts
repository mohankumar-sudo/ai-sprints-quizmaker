/**
 * @vitest-environment node
 */
import {
	getServerSession,
	signOutUser,
} from "@/lib/auth/sign-in";
import { createTestAuthEnvironment } from "@/lib/auth/test-utils";
import { describe, expect, it } from "vitest";

describe("session management", () => {
	it("persists session across simulated page reload", async () => {
		const { auth, registerTestUser, signInWithCredentials, validSignUp } =
			await createTestAuthEnvironment();
		await registerTestUser();

		const { headers } = await signInWithCredentials(
			validSignUp.email,
			validSignUp.password,
		);

		const session = await getServerSession(auth, headers);

		expect(session).toEqual({
			userId: expect.any(String),
			email: validSignUp.email,
			name: validSignUp.fullName,
		});
	});

	it("treats invalid sessions as logged out", async () => {
		const { auth } = await createTestAuthEnvironment();
		const headers = new Headers({
			cookie: "better-auth.session_token=invalid-token",
		});

		const session = await getServerSession(auth, headers);
		expect(session).toBeNull();
	});

	it("treats expired sessions as logged out", async () => {
		const { auth, database, registerTestUser, signInWithCredentials, validSignUp } =
			await createTestAuthEnvironment();
		await registerTestUser();

		const { headers } = await signInWithCredentials(
			validSignUp.email,
			validSignUp.password,
		);

		database
			.prepare("UPDATE session SET expiresAt = ?1")
			.run("2000-01-01T00:00:00.000Z");

		const session = await getServerSession(auth, headers);
		expect(session).toBeNull();
	});

	it("includes user identifier and email in session identity", async () => {
		const { auth, registerTestUser, signInWithCredentials, validSignUp } =
			await createTestAuthEnvironment();
		await registerTestUser();

		const { headers } = await signInWithCredentials(
			validSignUp.email,
			validSignUp.password,
		);

		const session = await getServerSession(auth, headers);

		expect(session?.userId).toBeTruthy();
		expect(session?.email).toBe(validSignUp.email);
		expect(session?.name).toBe(validSignUp.fullName);
	});

	it("clears session on logout", async () => {
		const { auth, registerTestUser, signInWithCredentials, validSignUp } =
			await createTestAuthEnvironment();
		await registerTestUser();

		const { headers } = await signInWithCredentials(
			validSignUp.email,
			validSignUp.password,
		);

		await signOutUser(auth, headers);

		const session = await getServerSession(auth, headers);
		expect(session).toBeNull();
	});
});
