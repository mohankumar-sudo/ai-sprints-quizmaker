import type { AuthInstance } from "@/lib/auth/registration";
import { getAuthDependencies } from "@/lib/auth/auth-deps";
import { emailExists } from "@/lib/db/users";
import type { RegistrationDependencies } from "@/lib/auth/registration";

export async function getRegistrationDependencies(): Promise<RegistrationDependencies> {
	const { auth, db } = await getAuthDependencies();

	return {
		auth,
		checkEmailExists: (email) => emailExists(db, email),
	};
}

export function createRegistrationDependencies(
	auth: AuthInstance,
	checkEmailExists: (email: string) => Promise<boolean>,
): RegistrationDependencies {
	return { auth, checkEmailExists };
}
