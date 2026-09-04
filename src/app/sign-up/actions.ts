"use server";

import { redirect } from "next/navigation";

import { registerUser } from "@/lib/auth/registration";
import { getRegistrationDependencies } from "@/lib/auth/registration-deps";
import type { SignUpField } from "@/lib/auth/validation";

export type SignUpActionState = {
	errors?: Partial<Record<SignUpField, string>>;
};

export async function signUpAction(
	_prevState: SignUpActionState,
	formData: FormData,
): Promise<SignUpActionState> {
	const input = {
		fullName: String(formData.get("fullName") ?? ""),
		email: String(formData.get("email") ?? ""),
		password: String(formData.get("password") ?? ""),
		confirmPassword: String(formData.get("confirmPassword") ?? ""),
	};

	const result = await registerUser(input, await getRegistrationDependencies());

	if (!result.success) {
		return { errors: result.errors };
	}

	redirect("/sign-in?registered=1");
}
