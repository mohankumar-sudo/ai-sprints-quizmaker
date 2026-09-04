import { AUTH_MESSAGES } from "@/lib/auth/messages";
import { applyAuthResponseCookies } from "@/lib/auth/apply-auth-cookies";
import type { SignInDependencies } from "@/lib/auth/sign-in-deps";
import { toSessionIdentity, type SessionIdentity } from "@/lib/auth/session";
import {
	type SignInField,
	type SignInInput,
	validateSignIn,
} from "@/lib/auth/validation";

export type SignInResult =
	| { success: true; session: SessionIdentity }
	| { success: false; errors: Partial<Record<SignInField, string>> }
	| { success: false; formError: string };

function isUnauthorizedError(error: unknown): boolean {
	return (
		error !== null &&
		typeof error === "object" &&
		"status" in error &&
		error.status === "UNAUTHORIZED"
	);
}

export async function signInUser(
	input: SignInInput,
	{ auth }: SignInDependencies,
	requestHeaders?: Headers,
): Promise<SignInResult> {
	const validation = validateSignIn(input);

	if (!validation.success) {
		return { success: false, errors: validation.errors };
	}

	const { email, password } = validation.data;

	try {
		const signInResult = await auth.api.signInEmail({
			body: { email, password },
			headers: requestHeaders,
			returnHeaders: true,
		});

		await applyAuthResponseCookies(signInResult.headers);

		const user = signInResult.response?.user;

		if (!user) {
			return {
				success: false,
				formError: AUTH_MESSAGES.signIn.invalidCredentials,
			};
		}

		return {
			success: true,
			session: toSessionIdentity({ user }),
		};
	} catch (error) {
		if (isUnauthorizedError(error)) {
			return {
				success: false,
				formError: AUTH_MESSAGES.signIn.invalidCredentials,
			};
		}

		return {
			success: false,
			formError: AUTH_MESSAGES.server.unexpected,
		};
	}
}

export async function getServerSession(
	auth: SignInDependencies["auth"],
	requestHeaders: Headers,
): Promise<SessionIdentity | null> {
	const session = await auth.api.getSession({ headers: requestHeaders });

	if (!session?.user) {
		return null;
	}

	return toSessionIdentity(session);
}

export async function signOutUser(
	auth: SignInDependencies["auth"],
	requestHeaders: Headers,
): Promise<void> {
	await auth.api.signOut({ headers: requestHeaders });
}
