import { MCQ_MESSAGES } from "@/lib/mcq/messages";
import type { McqChoiceInput, McqInput } from "@/lib/mcq/types";

const NAME_MAX_LENGTH = 100;
const QUESTION_MAX_LENGTH = 1000;
const CHOICE_TEXT_MAX_LENGTH = 500;
const MIN_CHOICES = 2;
const MAX_CHOICES = 6;

export type McqField = keyof McqInput | "choices";

export type McqValidationErrors = Partial<Record<McqField, string>>;

export type McqValidationResult =
	| { success: true; data: McqInput }
	| { success: false; errors: McqValidationErrors };

function validateName(name: string): string | undefined {
	const trimmed = name.trim();

	if (!trimmed) {
		return MCQ_MESSAGES.name.required;
	}

	if (trimmed.length > NAME_MAX_LENGTH) {
		return MCQ_MESSAGES.name.tooLong;
	}

	return undefined;
}

function validateQuestion(question: string): string | undefined {
	const trimmed = question.trim();

	if (!trimmed) {
		return MCQ_MESSAGES.question.required;
	}

	if (trimmed.length > QUESTION_MAX_LENGTH) {
		return MCQ_MESSAGES.question.tooLong;
	}

	return undefined;
}

function validateChoices(choices: McqChoiceInput[]): string | undefined {
	if (choices.length < MIN_CHOICES) {
		return MCQ_MESSAGES.choices.tooFew;
	}

	if (choices.length > MAX_CHOICES) {
		return MCQ_MESSAGES.choices.tooMany;
	}

	const normalizedTexts = new Set<string>();

	for (const choice of choices) {
		const trimmed = choice.choiceText.trim();

		if (!trimmed) {
			return MCQ_MESSAGES.choices.choiceTextRequired;
		}

		if (trimmed.length > CHOICE_TEXT_MAX_LENGTH) {
			return MCQ_MESSAGES.choices.choiceTextTooLong;
		}

		const normalized = trimmed.toLowerCase();

		if (normalizedTexts.has(normalized)) {
			return MCQ_MESSAGES.choices.duplicate;
		}

		normalizedTexts.add(normalized);
	}

	const correctCount = choices.filter((choice) => choice.isCorrect).length;

	if (correctCount === 0) {
		return MCQ_MESSAGES.choices.noCorrect;
	}

	if (correctCount > 1) {
		return MCQ_MESSAGES.choices.multipleCorrect;
	}

	return undefined;
}

export function validateMcqInput(input: McqInput): McqValidationResult {
	const errors: McqValidationErrors = {};

	const nameError = validateName(input.name);
	if (nameError) {
		errors.name = nameError;
	}

	const questionError = validateQuestion(input.question);
	if (questionError) {
		errors.question = questionError;
	}

	const choicesError = validateChoices(input.choices);
	if (choicesError) {
		errors.choices = choicesError;
	}

	if (Object.keys(errors).length > 0) {
		return { success: false, errors };
	}

	return {
		success: true,
		data: {
			name: input.name.trim(),
			question: input.question.trim(),
			choices: input.choices.map((choice) => ({
				choiceText: choice.choiceText.trim(),
				isCorrect: choice.isCorrect,
			})),
		},
	};
}
