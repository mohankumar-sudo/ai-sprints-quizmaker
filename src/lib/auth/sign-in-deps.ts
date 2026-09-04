import type { AuthInstance } from "@/lib/auth/registration";
import { getAuthDependencies } from "@/lib/auth/auth-deps";

export type SignInDependencies = {
	auth: AuthInstance;
};

export async function getSignInDependencies(): Promise<SignInDependencies> {
	const { auth } = await getAuthDependencies();
	return { auth };
}

export function createSignInDependencies(auth: AuthInstance): SignInDependencies {
	return { auth };
}
