/**
 * @vitest-environment node
 */
import { registerUser } from "@/lib/auth/registration";
import {
	getGuestRouteDecision,
	getProtectedRouteDecision,
} from "@/lib/auth/route-protection";
import { getServerSession, signOutUser } from "@/lib/auth/sign-in";
import { createTestAuthEnvironment } from "@/lib/auth/test-utils";
import { describe, expect, it } from "vitest";

describe("authentication journey", () => {
	it("completes sign up, sign in, dashboard access, logout, and blocks dashboard", async () => {
		const {
			auth,
			dependencies,
			validSignUp,
			signInWithCredentials,
		} = await createTestAuthEnvironment();

		const signUpResult = await registerUser(validSignUp, dependencies);
		expect(signUpResult).toEqual({ success: true });

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
		expect(getProtectedRouteDecision(session)).toEqual({ allowed: true });
		expect(getGuestRouteDecision(session)).toEqual({
			allowed: false,
			redirectTo: "/dashboard",
		});

		await signOutUser(auth, headers);

		const clearedSession = await getServerSession(auth, headers);
		expect(clearedSession).toBeNull();
		expect(getProtectedRouteDecision(clearedSession)).toEqual({
			allowed: false,
			redirectTo: "/sign-in",
		});
		expect(getGuestRouteDecision(clearedSession)).toEqual({ allowed: true });
	});
});
