import { MCQ_MESSAGES } from "@/lib/mcq/messages";
import { validateMcqInput } from "@/lib/mcq/validation";
import { describe, expect, it } from "vitest";

const validMcq = {
	name: "Capital cities",
	question: "What is the capital of France?",
	choices: [
		{ choiceText: "Paris", isCorrect: true },
		{ choiceText: "London", isCorrect: false },
	],
};

describe("MCQ validation", () => {
	it("accepts valid input", () => {
		const result = validateMcqInput(validMcq);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual(validMcq);
		}
	});

	it("rejects empty name", () => {
		const result = validateMcqInput({ ...validMcq, name: "" });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.name).toBe(MCQ_MESSAGES.name.required);
		}
	});

	it("rejects whitespace-only name", () => {
		const result = validateMcqInput({ ...validMcq, name: "   " });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.name).toBe(MCQ_MESSAGES.name.required);
		}
	});

	it("rejects name longer than 100 characters", () => {
		const result = validateMcqInput({ ...validMcq, name: "A".repeat(101) });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.name).toBe(MCQ_MESSAGES.name.tooLong);
		}
	});

	it("rejects empty question", () => {
		const result = validateMcqInput({ ...validMcq, question: "" });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.question).toBe(MCQ_MESSAGES.question.required);
		}
	});

	it("rejects question longer than 1000 characters", () => {
		const result = validateMcqInput({ ...validMcq, question: "Q".repeat(1001) });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.question).toBe(MCQ_MESSAGES.question.tooLong);
		}
	});

	it("rejects fewer than 2 choices", () => {
		const result = validateMcqInput({
			...validMcq,
			choices: [{ choiceText: "Only one", isCorrect: true }],
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.choices).toBe(MCQ_MESSAGES.choices.tooFew);
		}
	});

	it("rejects more than 6 choices", () => {
		const result = validateMcqInput({
			...validMcq,
			choices: Array.from({ length: 7 }, (_, index) => ({
				choiceText: `Choice ${index + 1}`,
				isCorrect: index === 0,
			})),
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.choices).toBe(MCQ_MESSAGES.choices.tooMany);
		}
	});

	it("rejects empty choice text", () => {
		const result = validateMcqInput({
			...validMcq,
			choices: [
				{ choiceText: "", isCorrect: true },
				{ choiceText: "London", isCorrect: false },
			],
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.choices).toBe(MCQ_MESSAGES.choices.choiceTextRequired);
		}
	});

	it("rejects choice text longer than 500 characters", () => {
		const result = validateMcqInput({
			...validMcq,
			choices: [
				{ choiceText: "A".repeat(501), isCorrect: true },
				{ choiceText: "London", isCorrect: false },
			],
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.choices).toBe(MCQ_MESSAGES.choices.choiceTextTooLong);
		}
	});

	it("rejects duplicate choice text", () => {
		const result = validateMcqInput({
			...validMcq,
			choices: [
				{ choiceText: "Paris", isCorrect: true },
				{ choiceText: " paris ", isCorrect: false },
			],
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.choices).toBe(MCQ_MESSAGES.choices.duplicate);
		}
	});

	it("rejects when no choice is marked correct", () => {
		const result = validateMcqInput({
			...validMcq,
			choices: [
				{ choiceText: "Paris", isCorrect: false },
				{ choiceText: "London", isCorrect: false },
			],
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.choices).toBe(MCQ_MESSAGES.choices.noCorrect);
		}
	});

	it("rejects when more than one choice is marked correct", () => {
		const result = validateMcqInput({
			...validMcq,
			choices: [
				{ choiceText: "Paris", isCorrect: true },
				{ choiceText: "London", isCorrect: true },
			],
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.choices).toBe(MCQ_MESSAGES.choices.multipleCorrect);
		}
	});
});
