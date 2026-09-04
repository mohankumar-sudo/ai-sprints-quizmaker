import { MCQ_MESSAGES } from "@/lib/mcq/messages";
import type {
	McqAttempt,
	McqInput,
	McqSummary,
	McqWithChoices,
} from "@/lib/mcq/types";
import {
	type McqValidationErrors,
	validateMcqInput,
} from "@/lib/mcq/validation";
import * as mcqDb from "@/lib/db/mcq";

export type McqRepository = typeof mcqDb;

export type McqServiceDependencies = {
	db: D1Database;
	repository: McqRepository;
	createId: () => string;
};

export type McqServiceResult<T> =
	| { success: true; data: T }
	| { success: false; errors: McqValidationErrors }
	| { success: false; notFound: true }
	| { success: false; error: string };

export function createMcqServiceDependencies(
	db: D1Database,
	overrides: Partial<McqServiceDependencies> = {},
): McqServiceDependencies {
	return {
		db,
		repository: mcqDb,
		createId: () => crypto.randomUUID(),
		...overrides,
	};
}

async function persistChoices(
	{ db, repository, createId }: McqServiceDependencies,
	mcqId: string,
	choices: McqInput["choices"],
): Promise<void> {
	await repository.insertChoices(
		db,
		mcqId,
		choices.map((choice, index) => ({
			id: createId(),
			choiceText: choice.choiceText,
			isCorrect: choice.isCorrect,
			sortOrder: index,
		})),
	);
}

export async function listMcqs(
	userId: string,
	dependencies: McqServiceDependencies,
): Promise<McqSummary[]> {
	return dependencies.repository.listMcqsByUserId(dependencies.db, userId);
}

export async function getMcq(
	mcqId: string,
	userId: string,
	dependencies: McqServiceDependencies,
): Promise<McqWithChoices | null> {
	return dependencies.repository.getMcqByIdForUser(
		dependencies.db,
		mcqId,
		userId,
	);
}

export async function createMcq(
	userId: string,
	input: McqInput,
	dependencies: McqServiceDependencies,
): Promise<McqServiceResult<McqWithChoices>> {
	const validation = validateMcqInput(input);

	if (!validation.success) {
		return { success: false, errors: validation.errors };
	}

	const mcqId = dependencies.createId();

	try {
		await dependencies.repository.insertMcq(dependencies.db, {
			id: mcqId,
			name: validation.data.name,
			question: validation.data.question,
			createdByUserId: userId,
		});
		await persistChoices(dependencies, mcqId, validation.data.choices);

		const created = await dependencies.repository.getMcqByIdForUser(
			dependencies.db,
			mcqId,
			userId,
		);

		if (!created) {
			return { success: false, error: MCQ_MESSAGES.server.unexpected };
		}

		return { success: true, data: created };
	} catch {
		return { success: false, error: MCQ_MESSAGES.server.unexpected };
	}
}

export async function updateMcq(
	mcqId: string,
	userId: string,
	input: McqInput,
	dependencies: McqServiceDependencies,
): Promise<McqServiceResult<McqWithChoices>> {
	const validation = validateMcqInput(input);

	if (!validation.success) {
		return { success: false, errors: validation.errors };
	}

	const existing = await dependencies.repository.getMcqByIdForUser(
		dependencies.db,
		mcqId,
		userId,
	);

	if (!existing) {
		return { success: false, notFound: true };
	}

	try {
		const updated = await dependencies.repository.updateMcq(
			dependencies.db,
			mcqId,
			userId,
			{
				name: validation.data.name,
				question: validation.data.question,
			},
		);

		if (!updated) {
			return { success: false, notFound: true };
		}

		await dependencies.repository.deleteChoicesByMcqId(dependencies.db, mcqId);
		await persistChoices(dependencies, mcqId, validation.data.choices);

		const saved = await dependencies.repository.getMcqByIdForUser(
			dependencies.db,
			mcqId,
			userId,
		);

		if (!saved) {
			return { success: false, error: MCQ_MESSAGES.server.unexpected };
		}

		return { success: true, data: saved };
	} catch {
		return { success: false, error: MCQ_MESSAGES.server.unexpected };
	}
}

export async function deleteMcqById(
	mcqId: string,
	userId: string,
	dependencies: McqServiceDependencies,
): Promise<McqServiceResult<null>> {
	const deleted = await dependencies.repository.deleteMcq(
		dependencies.db,
		mcqId,
		userId,
	);

	if (!deleted) {
		return { success: false, notFound: true };
	}

	return { success: true, data: null };
}

export async function recordAttempt(
	mcqId: string,
	userId: string,
	selectedChoiceId: string,
	dependencies: McqServiceDependencies,
): Promise<McqServiceResult<McqAttempt>> {
	if (!selectedChoiceId.trim()) {
		return {
			success: false,
			errors: { choices: MCQ_MESSAGES.choices.choiceTextRequired },
		};
	}

	const mcq = await dependencies.repository.getMcqById(dependencies.db, mcqId);

	if (!mcq) {
		return { success: false, notFound: true };
	}

	const choice = await dependencies.repository.getChoiceForMcq(
		dependencies.db,
		mcqId,
		selectedChoiceId,
	);

	if (!choice) {
		return {
			success: false,
			errors: { choices: MCQ_MESSAGES.choices.choiceTextRequired },
		};
	}

	const attemptId = dependencies.createId();

	try {
		await dependencies.repository.insertAttempt(dependencies.db, {
			id: attemptId,
			mcqId,
			userId,
			selectedChoiceId,
			isCorrect: choice.isCorrect,
		});

		return {
			success: true,
			data: {
				id: attemptId,
				mcqId,
				selectedChoiceId,
				isCorrect: choice.isCorrect,
				createdAt: new Date().toISOString(),
			},
		};
	} catch {
		return { success: false, error: MCQ_MESSAGES.server.unexpected };
	}
}
