import {
	DELETE_BY_ID,
	GET_BY_ID,
	PUT_BY_ID,
} from "@/lib/mcq/handlers";

type RouteContext = {
	params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
	const { id } = await context.params;
	return GET_BY_ID(_request, id);
}

export async function PUT(request: Request, context: RouteContext) {
	const { id } = await context.params;
	return PUT_BY_ID(request, id);
}

export async function DELETE(_request: Request, context: RouteContext) {
	const { id } = await context.params;
	return DELETE_BY_ID(_request, id);
}
