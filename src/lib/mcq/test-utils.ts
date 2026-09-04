import type { McqChoice, McqSummary } from "@/lib/mcq/types";
import type { McqRepository } from "@/lib/services/mcq-service";
import { createMcqServiceDependencies } from "@/lib/services/mcq-service";

type StoredMcq = McqSummary & {
	createdByUserId: string;
};

type StoredChoice = McqChoice & {
	mcqId: string;
};

type StoredAttempt = {
	id: string;
	mcqId: string;
	userId: string;
	selectedChoiceId: string;
	isCorrect: boolean;
	createdAt: string;
};

export function createInMemoryMcqRepository() {
	const mcqs = new Map<string, StoredMcq>();
	const choices = new Map<string, StoredChoice>();
	const attempts = new Map<string, StoredAttempt>();
	let idCounter = 0;

	const nextId = () => `mcq-test-id-${++idCounter}`;

	const repository: McqRepository = {
		listMcqsByUserId: async (_db, userId) => {
			return [...mcqs.values()]
				.filter((mcq) => mcq.createdByUserId === userId)
				.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
				.map(({ createdByUserId: _createdByUserId, ...summary }) => summary);
		},
		getMcqByIdForUser: async (_db, mcqId, userId) => {
			const mcq = mcqs.get(mcqId);

			if (!mcq || mcq.createdByUserId !== userId) {
				return null;
			}

			const mcqChoices = [...choices.values()]
				.filter((choice) => choice.mcqId === mcqId)
				.sort((left, right) => left.sortOrder - right.sortOrder)
				.map(({ mcqId: _mcqId, ...choice }) => choice);

			const { createdByUserId: _createdByUserId, ...summary } = mcq;

			return {
				...summary,
				choices: mcqChoices,
			};
		},
		getMcqById: async (_db, mcqId) => {
			const mcq = mcqs.get(mcqId);

			if (!mcq) {
				return null;
			}

			const { createdByUserId: _createdByUserId, ...summary } = mcq;
			return summary;
		},
		insertMcq: async (_db, input) => {
			const now = new Date().toISOString();
			mcqs.set(input.id, {
				id: input.id,
				name: input.name,
				question: input.question,
				createdByUserId: input.createdByUserId,
				createdAt: now,
				updatedAt: now,
			});
		},
		updateMcq: async (_db, mcqId, userId, input) => {
			const mcq = mcqs.get(mcqId);

			if (!mcq || mcq.createdByUserId !== userId) {
				return false;
			}

			mcqs.set(mcqId, {
				...mcq,
				name: input.name,
				question: input.question,
				updatedAt: new Date().toISOString(),
			});

			return true;
		},
		deleteMcq: async (_db, mcqId, userId) => {
			const mcq = mcqs.get(mcqId);

			if (!mcq || mcq.createdByUserId !== userId) {
				return false;
			}

			mcqs.delete(mcqId);

			for (const [choiceId, choice] of choices.entries()) {
				if (choice.mcqId === mcqId) {
					choices.delete(choiceId);
				}
			}

			for (const [attemptId, attempt] of attempts.entries()) {
				if (attempt.mcqId === mcqId) {
					attempts.delete(attemptId);
				}
			}

			return true;
		},
		deleteChoicesByMcqId: async (_db, mcqId) => {
			for (const [choiceId, choice] of choices.entries()) {
				if (choice.mcqId === mcqId) {
					choices.delete(choiceId);
				}
			}
		},
		insertChoices: async (_db, mcqId, newChoices) => {
			for (const choice of newChoices) {
				choices.set(choice.id, {
					id: choice.id,
					mcqId,
					choiceText: choice.choiceText,
					isCorrect: choice.isCorrect,
					sortOrder: choice.sortOrder,
				});
			}
		},
		getChoiceForMcq: async (_db, mcqId, choiceId) => {
			const choice = choices.get(choiceId);

			if (!choice || choice.mcqId !== mcqId) {
				return null;
			}

			const { mcqId: _mcqId, ...result } = choice;
			return result;
		},
		insertAttempt: async (_db, input) => {
			attempts.set(input.id, {
				id: input.id,
				mcqId: input.mcqId,
				userId: input.userId,
				selectedChoiceId: input.selectedChoiceId,
				isCorrect: input.isCorrect,
				createdAt: new Date().toISOString(),
			});
		},
	};

	return {
		repository,
		createDependencies: () => {
			const ids: string[] = [];

			return createMcqServiceDependencies({} as D1Database, {
				repository,
				createId: () => {
					const id = nextId();
					ids.push(id);
					return id;
				},
			});
		},
		getMcq: (mcqId: string) => mcqs.get(mcqId),
		getAttempts: () => [...attempts.values()],
	};
}

export type InMemoryMcqStore = ReturnType<typeof createInMemoryMcqRepository>;
