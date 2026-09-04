import type { McqChoice, McqSummary, McqWithChoices } from "@/lib/mcq/types";

type McqRow = {
	id: string;
	name: string;
	question: string;
	created_at: string;
	updated_at: string;
};

type McqChoiceRow = {
	id: string;
	mcq_id: string;
	choice_text: string;
	is_correct: number;
	sort_order: number;
};

function toMcqSummary(row: McqRow): McqSummary {
	return {
		id: row.id,
		name: row.name,
		question: row.question,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}

function toMcqChoice(row: McqChoiceRow): McqChoice {
	return {
		id: row.id,
		choiceText: row.choice_text,
		isCorrect: row.is_correct === 1,
		sortOrder: row.sort_order,
	};
}

export async function listMcqsByUserId(
	db: D1Database,
	userId: string,
): Promise<McqSummary[]> {
	const result = await db
		.prepare(
			`SELECT id, name, question, created_at, updated_at
			 FROM mcq
			 WHERE created_by_user_id = ?1
			 ORDER BY updated_at DESC`,
		)
		.bind(userId)
		.all<McqRow>();

	return result.results.map(toMcqSummary);
}

export async function getMcqByIdForUser(
	db: D1Database,
	mcqId: string,
	userId: string,
): Promise<McqWithChoices | null> {
	const mcqResult = await db
		.prepare(
			`SELECT id, name, question, created_at, updated_at
			 FROM mcq
			 WHERE id = ?1 AND created_by_user_id = ?2`,
		)
		.bind(mcqId, userId)
		.all<McqRow>();

	const mcqRow = mcqResult.results[0];

	if (!mcqRow) {
		return null;
	}

	const choicesResult = await db
		.prepare(
			`SELECT id, mcq_id, choice_text, is_correct, sort_order
			 FROM mcq_choice
			 WHERE mcq_id = ?1
			 ORDER BY sort_order ASC`,
		)
		.bind(mcqId)
		.all<McqChoiceRow>();

	return {
		...toMcqSummary(mcqRow),
		choices: choicesResult.results.map(toMcqChoice),
	};
}

export async function getMcqById(
	db: D1Database,
	mcqId: string,
): Promise<McqSummary | null> {
	const result = await db
		.prepare(
			`SELECT id, name, question, created_at, updated_at
			 FROM mcq
			 WHERE id = ?1`,
		)
		.bind(mcqId)
		.all<McqRow>();

	const row = result.results[0];

	if (!row) {
		return null;
	}

	return toMcqSummary(row);
}

export async function insertMcq(
	db: D1Database,
	input: {
		id: string;
		name: string;
		question: string;
		createdByUserId: string;
	},
): Promise<void> {
	await db
		.prepare(
			`INSERT INTO mcq (id, name, question, created_by_user_id, created_at, updated_at)
			 VALUES (?1, ?2, ?3, ?4, datetime('now'), datetime('now'))`,
		)
		.bind(input.id, input.name, input.question, input.createdByUserId)
		.run();
}

export async function updateMcq(
	db: D1Database,
	mcqId: string,
	userId: string,
	input: { name: string; question: string },
): Promise<boolean> {
	const result = await db
		.prepare(
			`UPDATE mcq
			 SET name = ?1, question = ?2, updated_at = datetime('now')
			 WHERE id = ?3 AND created_by_user_id = ?4`,
		)
		.bind(input.name, input.question, mcqId, userId)
		.run();

	return (result.meta.changes ?? 0) > 0;
}

export async function deleteMcq(
	db: D1Database,
	mcqId: string,
	userId: string,
): Promise<boolean> {
	const result = await db
		.prepare(
			`DELETE FROM mcq
			 WHERE id = ?1 AND created_by_user_id = ?2`,
		)
		.bind(mcqId, userId)
		.run();

	return (result.meta.changes ?? 0) > 0;
}

export async function deleteChoicesByMcqId(
	db: D1Database,
	mcqId: string,
): Promise<void> {
	await db
		.prepare("DELETE FROM mcq_choice WHERE mcq_id = ?1")
		.bind(mcqId)
		.run();
}

export async function insertChoices(
	db: D1Database,
	mcqId: string,
	choices: Array<{
		id: string;
		choiceText: string;
		isCorrect: boolean;
		sortOrder: number;
	}>,
): Promise<void> {
	const statements = choices.map((choice) =>
		db
			.prepare(
				`INSERT INTO mcq_choice (
					id, mcq_id, choice_text, is_correct, sort_order, created_at, updated_at
				) VALUES (?1, ?2, ?3, ?4, ?5, datetime('now'), datetime('now'))`,
			)
			.bind(
				choice.id,
				mcqId,
				choice.choiceText,
				choice.isCorrect ? 1 : 0,
				choice.sortOrder,
			),
	);

	if (statements.length > 0) {
		await db.batch(statements);
	}
}

export async function getChoiceForMcq(
	db: D1Database,
	mcqId: string,
	choiceId: string,
): Promise<McqChoice | null> {
	const result = await db
		.prepare(
			`SELECT id, mcq_id, choice_text, is_correct, sort_order
			 FROM mcq_choice
			 WHERE id = ?1 AND mcq_id = ?2`,
		)
		.bind(choiceId, mcqId)
		.all<McqChoiceRow>();

	const row = result.results[0];

	if (!row) {
		return null;
	}

	return toMcqChoice(row);
}

export async function insertAttempt(
	db: D1Database,
	input: {
		id: string;
		mcqId: string;
		userId: string;
		selectedChoiceId: string;
		isCorrect: boolean;
	},
): Promise<void> {
	await db
		.prepare(
			`INSERT INTO mcq_attempt (
				id, mcq_id, user_id, selected_choice_id, is_correct, created_at
			) VALUES (?1, ?2, ?3, ?4, ?5, datetime('now'))`,
		)
		.bind(
			input.id,
			input.mcqId,
			input.userId,
			input.selectedChoiceId,
			input.isCorrect ? 1 : 0,
		)
		.run();
}
