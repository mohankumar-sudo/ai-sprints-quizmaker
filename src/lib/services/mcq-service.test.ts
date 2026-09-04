/**
 * @vitest-environment node
 */
import { MCQ_MESSAGES } from "@/lib/mcq/messages";
import { createInMemoryMcqRepository } from "@/lib/mcq/test-utils";
import {
	createMcq,
	deleteMcqById,
	getMcq,
	listMcqs,
	recordAttempt,
	updateMcq,
} from "@/lib/services/mcq-service";
import { describe, expect, it } from "vitest";

const validMcq = {
	name: "Capital cities",
	question: "What is the capital of France?",
	choices: [
		{ choiceText: "Paris", isCorrect: true },
		{ choiceText: "London", isCorrect: false },
	],
};

describe("mcq service", () => {
	it("creates an mcq with choices for the owner", async () => {
		const store = createInMemoryMcqRepository();
		const dependencies = store.createDependencies();

		const result = await createMcq("user-1", validMcq, dependencies);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBe(validMcq.name);
			expect(result.data.choices).toHaveLength(2);
			expect(result.data.choices[0]?.choiceText).toBe("Paris");
		}

		const listed = await listMcqs("user-1", dependencies);
		expect(listed).toHaveLength(1);
	});

	it("rejects invalid mcq input", async () => {
		const store = createInMemoryMcqRepository();
		const dependencies = store.createDependencies();

		const result = await createMcq(
			"user-1",
			{ ...validMcq, name: "" },
			dependencies,
		);

		expect(result).toEqual({
			success: false,
			errors: { name: MCQ_MESSAGES.name.required },
		});
	});

	it("returns only mcqs owned by the user", async () => {
		const store = createInMemoryMcqRepository();
		const dependencies = store.createDependencies();

		await createMcq("user-1", validMcq, dependencies);
		await createMcq(
			"user-2",
			{ ...validMcq, name: "Other user question" },
			dependencies,
		);

		const listed = await listMcqs("user-1", dependencies);
		expect(listed).toHaveLength(1);
		expect(listed[0]?.name).toBe(validMcq.name);
	});

	it("updates an mcq and replaces its choices", async () => {
		const store = createInMemoryMcqRepository();
		const dependencies = store.createDependencies();

		const created = await createMcq("user-1", validMcq, dependencies);
		expect(created.success).toBe(true);

		if (!created.success) {
			return;
		}

		const updatedInput = {
			name: "Updated name",
			question: "Updated question?",
			choices: [
				{ choiceText: "Yes", isCorrect: false },
				{ choiceText: "No", isCorrect: true },
				{ choiceText: "Maybe", isCorrect: false },
			],
		};

		const result = await updateMcq(
			created.data.id,
			"user-1",
			updatedInput,
			dependencies,
		);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBe("Updated name");
			expect(result.data.choices).toHaveLength(3);
			expect(result.data.choices[1]?.isCorrect).toBe(true);
		}
	});

	it("returns not found when updating another users mcq", async () => {
		const store = createInMemoryMcqRepository();
		const dependencies = store.createDependencies();

		const created = await createMcq("user-1", validMcq, dependencies);
		expect(created.success).toBe(true);

		if (!created.success) {
			return;
		}

		const result = await updateMcq(
			created.data.id,
			"user-2",
			validMcq,
			dependencies,
		);

		expect(result).toEqual({ success: false, notFound: true });
	});

	it("deletes an mcq for the owner", async () => {
		const store = createInMemoryMcqRepository();
		const dependencies = store.createDependencies();

		const created = await createMcq("user-1", validMcq, dependencies);
		expect(created.success).toBe(true);

		if (!created.success) {
			return;
		}

		const deleted = await deleteMcqById(
			created.data.id,
			"user-1",
			dependencies,
		);

		expect(deleted).toEqual({ success: true, data: null });
		expect(await listMcqs("user-1", dependencies)).toHaveLength(0);
	});

	it("returns not found when deleting another users mcq", async () => {
		const store = createInMemoryMcqRepository();
		const dependencies = store.createDependencies();

		const created = await createMcq("user-1", validMcq, dependencies);
		expect(created.success).toBe(true);

		if (!created.success) {
			return;
		}

		const result = await deleteMcqById(
			created.data.id,
			"user-2",
			dependencies,
		);

		expect(result).toEqual({ success: false, notFound: true });
	});

	it("records an attempt with correctness", async () => {
		const store = createInMemoryMcqRepository();
		const dependencies = store.createDependencies();

		const created = await createMcq("user-1", validMcq, dependencies);
		expect(created.success).toBe(true);

		if (!created.success) {
			return;
		}

		const wrongChoice = created.data.choices[1]?.id;
		expect(wrongChoice).toBeTruthy();

		const result = await recordAttempt(
			created.data.id,
			"user-2",
			wrongChoice!,
			dependencies,
		);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.isCorrect).toBe(false);
		}

		expect(store.getAttempts()).toHaveLength(1);
	});

	it("rejects attempts for invalid choices", async () => {
		const store = createInMemoryMcqRepository();
		const dependencies = store.createDependencies();

		const created = await createMcq("user-1", validMcq, dependencies);
		expect(created.success).toBe(true);

		if (!created.success) {
			return;
		}

		const result = await recordAttempt(
			created.data.id,
			"user-2",
			"missing-choice",
			dependencies,
		);

		expect(result.success).toBe(false);
	});

	it("loads a single mcq for the owner", async () => {
		const store = createInMemoryMcqRepository();
		const dependencies = store.createDependencies();

		const created = await createMcq("user-1", validMcq, dependencies);
		expect(created.success).toBe(true);

		if (!created.success) {
			return;
		}

		const loaded = await getMcq(created.data.id, "user-1", dependencies);
		expect(loaded?.question).toBe(validMcq.question);

		const hidden = await getMcq(created.data.id, "user-2", dependencies);
		expect(hidden).toBeNull();
	});
});
