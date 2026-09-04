"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { signInUser } from "@/lib/auth/sign-in";
import { getSignInDependencies } from "@/lib/auth/sign-in-deps";
import type { SignInField } from "@/lib/auth/validation";

export type SignInActionState = {
	errors?: Partial<Record<SignInField, string>>;
	formError?: string;
};

export async function signInAction(
	_prevState: SignInActionState,
	formData: FormData,
): Promise<SignInActionState> {
	const input = {
		email: String(formData.get("email") ?? ""),
		password: String(formData.get("password") ?? ""),
	};

	const result = await signInUser(
		input,
		await getSignInDependencies(),
		await headers(),
	);

	if (!result.success) {
		if ("formError" in result) {
			return { formError: result.formError };
		}

		return { errors: result.errors };
	}

	redirect("/dashboard");
}
