import { getCloudflareContext } from "@opennextjs/cloudflare";

import { getAuthEnvFromBindings } from "@/lib/auth/config";
import { createAuth } from "@/lib/auth/server";

export async function getAuthDependencies() {
	const { env } = await getCloudflareContext({ async: true });

	return {
		auth: createAuth(env.DB, getAuthEnvFromBindings(env)),
		db: env.DB,
	};
}
