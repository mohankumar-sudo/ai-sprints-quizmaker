import { betterAuth } from "better-auth";

import { AUTH_MESSAGES } from "@/lib/auth/messages";
import {
	type SignUpField,
	type SignUpInput,
	validateSignUp,
} from "@/lib/auth/validation";

export type AuthInstance = ReturnType<typeof betterAuth>;

export type RegistrationDependencies = {
	auth: AuthInstance;
	checkEmailExists: (email: string) => Promise<boolean>;
};

export type RegistrationResult =
	| { success: true }
	| { success: false; errors: Partial<Record<SignUpField, string>> };

export async function registerUser(
	input: SignUpInput,
	{ auth, checkEmailExists }: RegistrationDependencies,
): Promise<RegistrationResult> {
	const validation = validateSignUp(input);

	if (!validation.success) {
		return { success: false, errors: validation.errors };
	}

	const { fullName, email, password } = validation.data;

	if (await checkEmailExists(email)) {
		return {
			success: false,
			errors: { email: AUTH_MESSAGES.email.alreadyRegistered },
		};
	}

	try {
		const result = await auth.api.signUpEmail({
			body: {
				name: fullName,
				email,
				password,
			},
		});

		if (!result?.user) {
			return {
				success: false,
				errors: { email: AUTH_MESSAGES.server.unexpected },
			};
		}

		return { success: true };
	} catch (error) {
		if (
			error &&
			typeof error === "object" &&
			"status" in error &&
			error.status === "UNPROCESSABLE_ENTITY"
		) {
			return {
				success: false,
				errors: { email: AUTH_MESSAGES.email.alreadyRegistered },
			};
		}

		return {
			success: false,
			errors: { email: AUTH_MESSAGES.server.unexpected },
		};
	}
}
