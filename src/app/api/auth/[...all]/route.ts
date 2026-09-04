import { toNextJsHandler } from "better-auth/next-js";

import { getAuth } from "@/lib/auth/server";

async function getHandler() {
	return toNextJsHandler(await getAuth());
}

export async function GET(request: Request) {
	const handler = await getHandler();
	return handler.GET(request);
}

export async function POST(request: Request) {
	const handler = await getHandler();
	return handler.POST(request);
}
