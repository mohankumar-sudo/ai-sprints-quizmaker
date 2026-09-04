export const MCQ_MESSAGES = {
	name: {
		required: "Name is required.",
		tooLong: "Name must be 100 characters or fewer.",
	},
	question: {
		required: "Question is required.",
		tooLong: "Question must be 1000 characters or fewer.",
	},
	choices: {
		tooFew: "At least 2 choices are required.",
		tooMany: "No more than 6 choices are allowed.",
		choiceTextRequired: "Choice text is required.",
		choiceTextTooLong: "Choice text must be 500 characters or fewer.",
		duplicate: "Choices must be unique.",
		noCorrect: "Select one correct answer.",
		multipleCorrect: "Only one choice can be marked correct.",
	},
	notFound: "Question not found.",
	delete: {
		title: "Delete question?",
		body: "This will permanently delete the question and all its attempts. This cannot be undone.",
	},
	preview: {
		selectChoice: "Please select an answer.",
		correct: "Correct!",
		incorrect: "Incorrect.",
		submit: "Submit answer",
		submitting: "Submitting...",
		back: "Back to questions",
	},
	server: {
		unexpected: "Something went wrong. Please try again later.",
	},
} as const;
