import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";

import { getServerSession } from "@/lib/auth/sign-in";
import { getAuth } from "@/lib/auth/server";
import { MCQ_MESSAGES } from "@/lib/mcq/messages";
import type { McqInput } from "@/lib/mcq/types";
import {
	createMcqServiceDependencies,
	type McqServiceDependencies,
	type McqServiceResult,
} from "@/lib/services/mcq-service";
import type { SessionIdentity } from "@/lib/auth/session";

export async function getMcqApiContext(): Promise<{
	session: SessionIdentity;
	dependencies: McqServiceDependencies;
} | null> {
	const auth = await getAuth();
	const session = await getServerSession(auth, await headers());

	if (!session) {
		return null;
	}

	const { env } = await getCloudflareContext({ async: true });

	return {
		session,
		dependencies: createMcqServiceDependencies(env.DB),
	};
}

export function unauthorizedResponse() {
	return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export function notFoundResponse() {
	return Response.json({ error: MCQ_MESSAGES.notFound }, { status: 404 });
}

export function validationErrorResponse(errors: Record<string, string>) {
	return Response.json({ errors }, { status: 400 });
}

export function serverErrorResponse() {
	return Response.json(
		{ error: MCQ_MESSAGES.server.unexpected },
		{ status: 500 },
	);
}

export function mapServiceResult<T>(
	result: McqServiceResult<T>,
	options: { created?: boolean } = {},
): Response {
	if (result.success) {
		return Response.json(result.data, {
			status: options.created ? 201 : 200,
		});
	}

	if ("notFound" in result && result.notFound) {
		return notFoundResponse();
	}

	if ("errors" in result && result.errors) {
		return validationErrorResponse(result.errors);
	}

	return serverErrorResponse();
}

export async function parseMcqInput(request: Request): Promise<McqInput | null> {
	try {
		const body = (await request.json()) as McqInput;
		return body;
	} catch {
		return null;
	}
}

export async function parseAttemptInput(
	request: Request,
): Promise<{ selectedChoiceId: string } | null> {
	try {
		const body = (await request.json()) as { selectedChoiceId?: string };

		if (!body.selectedChoiceId) {
			return null;
		}

		return { selectedChoiceId: body.selectedChoiceId };
	} catch {
		return null;
	}
}
