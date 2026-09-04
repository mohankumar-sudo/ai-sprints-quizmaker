import { betterAuth } from "better-auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import { type AuthEnv, getAuthEnvFromBindings, getAuthOptions } from "@/lib/auth/config";

export function createAuth(database: unknown, authEnv: AuthEnv = {}) {
	return betterAuth(getAuthOptions(database, authEnv));
}

export async function getAuth() {
	const { env } = await getCloudflareContext({ async: true });
	return createAuth(env.DB, getAuthEnvFromBindings(env));
}
