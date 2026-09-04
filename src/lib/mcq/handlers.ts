import {
	getMcqApiContext,
	mapServiceResult,
	parseAttemptInput,
	parseMcqInput,
	unauthorizedResponse,
	validationErrorResponse,
} from "@/lib/mcq/api";
import {
	createMcq,
	deleteMcqById,
	getMcq,
	listMcqs,
	recordAttempt,
	updateMcq,
} from "@/lib/services/mcq-service";

export async function GET() {
	const context = await getMcqApiContext();

	if (!context) {
		return unauthorizedResponse();
	}

	const mcqs = await listMcqs(context.session.userId, context.dependencies);
	return Response.json({ mcqs });
}

export async function POST(request: Request) {
	const context = await getMcqApiContext();

	if (!context) {
		return unauthorizedResponse();
	}

	const input = await parseMcqInput(request);

	if (!input) {
		return validationErrorResponse({
			name: "Invalid request body.",
		});
	}

	const result = await createMcq(
		context.session.userId,
		input,
		context.dependencies,
	);

	return mapServiceResult(result, { created: true });
}

export async function GET_BY_ID(_request: Request, mcqId: string) {
	const context = await getMcqApiContext();

	if (!context) {
		return unauthorizedResponse();
	}

	const mcq = await getMcq(mcqId, context.session.userId, context.dependencies);

	if (!mcq) {
		return mapServiceResult({ success: false, notFound: true });
	}

	return Response.json(mcq);
}

export async function PUT_BY_ID(request: Request, mcqId: string) {
	const context = await getMcqApiContext();

	if (!context) {
		return unauthorizedResponse();
	}

	const input = await parseMcqInput(request);

	if (!input) {
		return validationErrorResponse({
			name: "Invalid request body.",
		});
	}

	const result = await updateMcq(
		mcqId,
		context.session.userId,
		input,
		context.dependencies,
	);

	return mapServiceResult(result);
}

export async function DELETE_BY_ID(_request: Request, mcqId: string) {
	const context = await getMcqApiContext();

	if (!context) {
		return unauthorizedResponse();
	}

	const result = await deleteMcqById(
		mcqId,
		context.session.userId,
		context.dependencies,
	);

	if (result.success) {
		return new Response(null, { status: 204 });
	}

	return mapServiceResult(result);
}

export async function POST_ATTEMPT(request: Request, mcqId: string) {
	const context = await getMcqApiContext();

	if (!context) {
		return unauthorizedResponse();
	}

	const input = await parseAttemptInput(request);

	if (!input) {
		return validationErrorResponse({
			selectedChoiceId: "Selected choice is required.",
		});
	}

	const result = await recordAttempt(
		mcqId,
		context.session.userId,
		input.selectedChoiceId,
		context.dependencies,
	);

	return mapServiceResult(result, { created: true });
}
