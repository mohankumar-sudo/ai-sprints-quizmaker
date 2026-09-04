import { POST_ATTEMPT } from "@/lib/mcq/handlers";

type RouteContext = {
	params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
	const { id } = await context.params;
	return POST_ATTEMPT(request, id);
}
