"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { FormAlert } from "@/components/auth/form-alert";
import { Button, ButtonLink } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MCQ_MESSAGES } from "@/lib/mcq/messages";
import type { McqChoiceInput, McqInput } from "@/lib/mcq/types";
import {
	type McqField,
	validateMcqInput,
} from "@/lib/mcq/validation";

const DEFAULT_CHOICES: McqChoiceInput[] = [
	{ choiceText: "", isCorrect: true },
	{ choiceText: "", isCorrect: false },
];

type McqFormProps = {
	mode: "create" | "edit";
	mcqId?: string;
	initialValues?: McqInput;
};

export function McqForm({ mode, mcqId, initialValues }: McqFormProps) {
	const router = useRouter();
	const [name, setName] = useState(initialValues?.name ?? "");
	const [question, setQuestion] = useState(initialValues?.question ?? "");
	const [choices, setChoices] = useState<McqChoiceInput[]>(
		initialValues?.choices ?? DEFAULT_CHOICES,
	);
	const [errors, setErrors] = useState<Partial<Record<McqField, string>>>({});
	const [formError, setFormError] = useState<string>();
	const [isPending, setIsPending] = useState(false);

	function updateChoice(
		index: number,
		updates: Partial<McqChoiceInput>,
	): void {
		setChoices((current) =>
			current.map((choice, choiceIndex) =>
				choiceIndex === index ? { ...choice, ...updates } : choice,
			),
		);
	}

	function markCorrect(index: number): void {
		setChoices((current) =>
			current.map((choice, choiceIndex) => ({
				...choice,
				isCorrect: choiceIndex === index,
			})),
		);
	}

	function addChoice(): void {
		setChoices((current) => {
			if (current.length >= 6) {
				return current;
			}

			return [...current, { choiceText: "", isCorrect: false }];
		});
	}

	function removeChoice(index: number): void {
		setChoices((current) => {
			if (current.length <= 2) {
				return current;
			}

			const next = current.filter((_, choiceIndex) => choiceIndex !== index);

			if (!next.some((choice) => choice.isCorrect)) {
				next[0] = { ...next[0]!, isCorrect: true };
			}

			return next;
		});
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setErrors({});
		setFormError(undefined);
		setIsPending(true);

		const input: McqInput = { name, question, choices };
		const validation = validateMcqInput(input);

		if (!validation.success) {
			setErrors(validation.errors);
			setIsPending(false);
			return;
		}

		const response = await fetch(
			mode === "create" ? "/api/mcqs" : `/api/mcqs/${mcqId}`,
			{
				method: mode === "create" ? "POST" : "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(validation.data),
			},
		);

		if (!response.ok) {
			const body = (await response.json().catch(() => null)) as {
				errors?: Partial<Record<McqField, string>>;
				error?: string;
			} | null;

			if (body?.errors) {
				setErrors(body.errors);
			} else {
				setFormError(body?.error ?? MCQ_MESSAGES.server.unexpected);
			}

			setIsPending(false);
			return;
		}

		router.push("/mcqs");
		router.refresh();
	}

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>
					{mode === "create" ? "Create question" : "Edit question"}
				</CardTitle>
				<CardDescription>
					Define the question prompt and between 2 and 6 answer choices.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={handleSubmit}
					aria-label={mode === "create" ? "Create question" : "Edit question"}
					className="space-y-5"
					noValidate
				>
					<FieldGroup aria-live="polite" aria-atomic="true">
						{formError ? <FormAlert>{formError}</FormAlert> : null}

						<Field data-invalid={Boolean(errors.name)}>
							<FieldLabel htmlFor="mcq-name">Name</FieldLabel>
							<Input
								id="mcq-name"
								name="name"
								value={name}
								onChange={(event) => setName(event.target.value)}
								autoComplete="off"
								aria-invalid={Boolean(errors.name)}
							/>
							<FieldError errors={errors.name ? [{ message: errors.name }] : []} />
						</Field>

						<Field data-invalid={Boolean(errors.question)}>
							<FieldLabel htmlFor="mcq-question">Question</FieldLabel>
							<Textarea
								id="mcq-question"
								name="question"
								value={question}
								onChange={(event) => setQuestion(event.target.value)}
								rows={4}
								aria-invalid={Boolean(errors.question)}
							/>
							<FieldError
								errors={
									errors.question ? [{ message: errors.question }] : []
								}
							/>
						</Field>

						<fieldset className="space-y-3">
							<legend className="text-sm font-medium">Choices</legend>
							{errors.choices ? (
								<p className="text-sm text-destructive" role="alert">
									{errors.choices}
								</p>
							) : null}
							<div className="space-y-3">
								{choices.map((choice, index) => (
									<div
										key={`choice-${index}`}
										className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center"
									>
										<label className="flex items-center gap-2 text-sm">
											<input
												type="radio"
												name="correct-choice"
												checked={choice.isCorrect}
												onChange={() => markCorrect(index)}
												aria-label={`Mark choice ${index + 1} as correct`}
											/>
											Correct
										</label>
										<Input
											value={choice.choiceText}
											onChange={(event) =>
												updateChoice(index, {
													choiceText: event.target.value,
												})
											}
											placeholder={`Choice ${index + 1}`}
											aria-label={`Choice ${index + 1}`}
											className="flex-1"
										/>
										<Button
											type="button"
											variant="outline"
											onClick={() => removeChoice(index)}
											disabled={choices.length <= 2}
										>
											Remove
										</Button>
									</div>
								))}
							</div>
							<Button
								type="button"
								variant="outline"
								onClick={addChoice}
								disabled={choices.length >= 6}
							>
								Add choice
							</Button>
						</fieldset>
					</FieldGroup>

					<CardFooter className="flex flex-col gap-3 px-0 sm:flex-row sm:justify-end">
						<ButtonLink href="/mcqs" variant="outline">
							Cancel
						</ButtonLink>
						<Button type="submit" disabled={isPending}>
							{isPending ? "Saving..." : "Save"}
						</Button>
					</CardFooter>
				</form>
			</CardContent>
		</Card>
	);
}
