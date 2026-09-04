"use client";

import { useState } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { MCQ_MESSAGES } from "@/lib/mcq/messages";
import type { McqWithChoices } from "@/lib/mcq/types";

type McqPreviewProps = {
	mcq: McqWithChoices;
};

export function McqPreview({ mcq }: McqPreviewProps) {
	const [selectedChoiceId, setSelectedChoiceId] = useState<string>();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string>();
	const [result, setResult] = useState<"correct" | "incorrect">();

	const sortedChoices = [...mcq.choices].sort(
		(a, b) => a.sortOrder - b.sortOrder,
	);

	async function submitAnswer() {
		if (!selectedChoiceId) {
			setSubmitError(MCQ_MESSAGES.preview.selectChoice);
			return;
		}

		setIsSubmitting(true);
		setSubmitError(undefined);

		const response = await fetch(`/api/mcqs/${mcq.id}/attempts`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ selectedChoiceId }),
		});

		if (!response.ok) {
			setSubmitError(MCQ_MESSAGES.server.unexpected);
			setIsSubmitting(false);
			return;
		}

		const attempt = (await response.json()) as { isCorrect: boolean };
		setResult(attempt.isCorrect ? "correct" : "incorrect");
		setIsSubmitting(false);
	}

	return (
		<section aria-labelledby="preview-heading" className="space-y-6">
			<div className="space-y-1">
				<h1 id="preview-heading" className="text-2xl font-semibold">
					Preview question
				</h1>
				<p className="text-sm text-muted-foreground">
					Try answering this question. Your attempt will be recorded.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-sm font-normal text-muted-foreground">
						{mcq.name}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-base font-medium">{mcq.question}</p>

					<fieldset className="space-y-2" disabled={result !== undefined}>
						<legend className="sr-only">Answer choices</legend>
						{sortedChoices.map((choice) => (
							<label
								key={choice.id}
								className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 has-disabled:cursor-not-allowed has-disabled:opacity-60"
							>
								<input
									type="radio"
									name="preview-choice"
									value={choice.id}
									checked={selectedChoiceId === choice.id}
									onChange={() => {
										setSelectedChoiceId(choice.id);
										setSubmitError(undefined);
									}}
									className="size-4"
								/>
								<span>{choice.choiceText}</span>
							</label>
						))}
					</fieldset>

					{submitError ? (
						<p className="text-sm text-destructive" role="alert">
							{submitError}
						</p>
					) : null}

					{result ? (
						<p
							className={
								result === "correct"
									? "text-sm font-medium text-green-700 dark:text-green-400"
									: "text-sm font-medium text-destructive"
							}
							role="status"
						>
							{result === "correct"
								? MCQ_MESSAGES.preview.correct
								: MCQ_MESSAGES.preview.incorrect}
						</p>
					) : null}
				</CardContent>
				<CardFooter className="border-t-0 bg-transparent">
					<Button
						type="button"
						onClick={submitAnswer}
						disabled={isSubmitting || result !== undefined}
					>
						{isSubmitting
							? MCQ_MESSAGES.preview.submitting
							: MCQ_MESSAGES.preview.submit}
					</Button>
				</CardFooter>
			</Card>

			<ButtonLink href="/mcqs" variant="outline">
				{MCQ_MESSAGES.preview.back}
			</ButtonLink>
		</section>
	);
}
