/**
 * @vitest-environment node
 */
import { MCQ_MESSAGES } from "@/lib/mcq/messages";
import {
	DELETE_BY_ID,
	GET,
	GET_BY_ID,
	POST,
	POST_ATTEMPT,
	PUT_BY_ID,
} from "@/lib/mcq/handlers";
import { createInMemoryMcqRepository } from "@/lib/mcq/test-utils";
import type { SessionIdentity } from "@/lib/auth/session";
import { beforeEach, describe, expect, it, vi } from "vitest";

const session: SessionIdentity = {
	userId: "user-1",
	email: "user@example.com",
	name: "Test User",
};

const validMcq = {
	name: "Capital cities",
	question: "What is the capital of France?",
	choices: [
		{ choiceText: "Paris", isCorrect: true },
		{ choiceText: "London", isCorrect: false },
	],
};

let store = createInMemoryMcqRepository();

vi.mock("@/lib/mcq/api", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/lib/mcq/api")>();

	return {
		...actual,
		getMcqApiContext: vi.fn(async () => ({
			session,
			dependencies: store.createDependencies(),
		})),
	};
});

describe("mcq api handlers", () => {
	beforeEach(() => {
		store = createInMemoryMcqRepository();
	});

	it("returns 401 when unauthenticated", async () => {
		const { getMcqApiContext, unauthorizedResponse } = await import(
			"@/lib/mcq/api"
		);
		vi.mocked(getMcqApiContext).mockResolvedValueOnce(null);

		const response = await GET();

		expect(response.status).toBe(unauthorizedResponse().status);
	});

	it("lists mcqs for the authenticated user", async () => {
		await POST(
			new Request("http://localhost/api/mcqs", {
				method: "POST",
				body: JSON.stringify(validMcq),
			}),
		);

		const response = await GET();
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(body.mcqs).toHaveLength(1);
		expect(body.mcqs[0].name).toBe(validMcq.name);
	});

	it("creates an mcq", async () => {
		const response = await POST(
			new Request("http://localhost/api/mcqs", {
				method: "POST",
				body: JSON.stringify(validMcq),
			}),
		);

		expect(response.status).toBe(201);
		const body = await response.json();
		expect(body.choices).toHaveLength(2);
	});

	it("returns 400 for invalid create payload", async () => {
		const response = await POST(
			new Request("http://localhost/api/mcqs", {
				method: "POST",
				body: JSON.stringify({ ...validMcq, name: "" }),
			}),
		);

		expect(response.status).toBe(400);
		const body = await response.json();
		expect(body.errors.name).toBe(MCQ_MESSAGES.name.required);
	});

	it("gets, updates, and deletes an mcq by id", async () => {
		const created = await POST(
			new Request("http://localhost/api/mcqs", {
				method: "POST",
				body: JSON.stringify(validMcq),
			}),
		);
		const createdBody = await created.json();

		const fetched = await GET_BY_ID(
			new Request("http://localhost"),
			createdBody.id,
		);
		expect(fetched.status).toBe(200);

		const updated = await PUT_BY_ID(
			new Request("http://localhost", {
				method: "PUT",
				body: JSON.stringify({
					...validMcq,
					name: "Updated",
				}),
			}),
			createdBody.id,
		);
		expect(updated.status).toBe(200);
		const updatedBody = await updated.json();
		expect(updatedBody.name).toBe("Updated");

		const deleted = await DELETE_BY_ID(
			new Request("http://localhost"),
			createdBody.id,
		);
		expect(deleted.status).toBe(204);

		const missing = await GET_BY_ID(
			new Request("http://localhost"),
			createdBody.id,
		);
		expect(missing.status).toBe(404);
	});

	it("records an attempt", async () => {
		const created = await POST(
			new Request("http://localhost/api/mcqs", {
				method: "POST",
				body: JSON.stringify(validMcq),
			}),
		);
		const createdBody = await created.json();
		const choiceId = createdBody.choices[0].id;

		const response = await POST_ATTEMPT(
			new Request("http://localhost", {
				method: "POST",
				body: JSON.stringify({ selectedChoiceId: choiceId }),
			}),
			createdBody.id,
		);

		expect(response.status).toBe(201);
		const body = await response.json();
		expect(body.isCorrect).toBe(true);
	});
});
