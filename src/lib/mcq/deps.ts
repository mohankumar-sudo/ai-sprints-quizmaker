import { getCloudflareContext } from "@opennextjs/cloudflare";

import { createMcqServiceDependencies } from "@/lib/services/mcq-service";

export async function getMcqDependencies() {
	const { env } = await getCloudflareContext({ async: true });
	return createMcqServiceDependencies(env.DB);
}
