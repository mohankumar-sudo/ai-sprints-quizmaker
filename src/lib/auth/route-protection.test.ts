/**
 * @vitest-environment node
 */
import {
	getGuestRouteDecision,
	getProtectedRouteDecision,
	hasSessionCookie,
	PROTECTED_ROUTES,
} from "@/lib/auth/route-protection";
import { getServerSession, signOutUser } from "@/lib/auth/sign-in";
import { createTestAuthEnvironment } from "@/lib/auth/test-utils";
import { describe, expect, it } from "vitest";

describe("route protection", () => {
	it("redirects unauthenticated dashboard requests to sign in", () => {
		expect(getProtectedRouteDecision(null)).toEqual({
			allowed: false,
			redirectTo: "/sign-in",
		});
	});

	it("allows authenticated dashboard requests", () => {
		const session = {
			userId: "user-1",
			email: "jane@example.com",
			name: "Jane Doe",
		};

		expect(getProtectedRouteDecision(session)).toEqual({ allowed: true });
	});

	it("blocks dashboard access after logout", async () => {
		const { auth, registerTestUser, signInWithCredentials, validSignUp } =
			await createTestAuthEnvironment();
		await registerTestUser();

		const { headers } = await signInWithCredentials(
			validSignUp.email,
			validSignUp.password,
		);

		const activeSession = await getServerSession(auth, headers);
		expect(getProtectedRouteDecision(activeSession)).toEqual({
			allowed: true,
		});

		await signOutUser(auth, headers);

		const clearedSession = await getServerSession(auth, headers);
		expect(getProtectedRouteDecision(clearedSession)).toEqual({
			allowed: false,
			redirectTo: "/sign-in",
		});
	});
});

describe("guest route protection", () => {
	it("redirects authenticated users away from sign in", () => {
		const session = {
			userId: "user-1",
			email: "jane@example.com",
			name: "Jane Doe",
		};

		expect(getGuestRouteDecision(session)).toEqual({
			allowed: false,
			redirectTo: "/dashboard",
		});
	});

	it("allows unauthenticated users to access sign in", () => {
		expect(getGuestRouteDecision(null)).toEqual({ allowed: true });
	});
});

describe("protected routes config", () => {
	it("includes dashboard and mcqs", () => {
		expect(PROTECTED_ROUTES).toContain("/dashboard");
		expect(PROTECTED_ROUTES).toContain("/mcqs");
	});
});

describe("session cookie detection", () => {
	it("detects the development session cookie name", () => {
		expect(
			hasSessionCookie({
				get: (name) =>
					name === "better-auth.session_token"
						? { value: "token" }
						: undefined,
			}),
		).toBe(true);
	});

	it("detects the secure production session cookie name", () => {
		expect(
			hasSessionCookie({
				get: (name) =>
					name === "__Secure-better-auth.session_token"
						? { value: "token" }
						: undefined,
			}),
		).toBe(true);
	});

	it("returns false when no session cookie is present", () => {
		expect(
			hasSessionCookie({
				get: () => undefined,
			}),
		).toBe(false);
	});
});
