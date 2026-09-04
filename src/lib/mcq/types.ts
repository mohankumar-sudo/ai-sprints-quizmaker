export type McqChoiceInput = {
	choiceText: string;
	isCorrect: boolean;
};

export type McqInput = {
	name: string;
	question: string;
	choices: McqChoiceInput[];
};

export type McqChoice = {
	id: string;
	choiceText: string;
	isCorrect: boolean;
	sortOrder: number;
};

export type McqSummary = {
	id: string;
	name: string;
	question: string;
	createdAt: string;
	updatedAt: string;
};

export type McqWithChoices = McqSummary & {
	choices: McqChoice[];
};

export type McqAttempt = {
	id: string;
	mcqId: string;
	selectedChoiceId: string;
	isCorrect: boolean;
	createdAt: string;
};
