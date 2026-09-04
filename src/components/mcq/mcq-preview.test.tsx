import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { McqPreview } from "@/components/mcq/mcq-preview";
import type { McqWithChoices } from "@/lib/mcq/types";

const mcq: McqWithChoices = {
	id: "mcq-1",
	name: "Q1",
	question: "Which is our National Bird?",
	createdAt: "2026-09-04T10:00:00.000Z",
	updatedAt: "2026-09-04T10:00:00.000Z",
	choices: [
		{
			id: "choice-1",
			choiceText: "Pigeon",
			isCorrect: false,
			sortOrder: 0,
		},
		{
			id: "choice-2",
			choiceText: "Peacock",
			isCorrect: true,
			sortOrder: 1,
		},
	],
};

describe("McqPreview", () => {
	it("renders the question and choices", () => {
		render(<McqPreview mcq={mcq} />);

		expect(screen.getByText("Preview question")).toBeInTheDocument();
		expect(screen.getByText("Which is our National Bird?")).toBeInTheDocument();
		expect(screen.getByLabelText("Pigeon")).toBeInTheDocument();
		expect(screen.getByLabelText("Peacock")).toBeInTheDocument();
	});

	it("requires a choice before submitting", async () => {
		const user = userEvent.setup();
		render(<McqPreview mcq={mcq} />);

		await user.click(screen.getByRole("button", { name: "Submit answer" }));

		expect(screen.getByText("Please select an answer.")).toBeInTheDocument();
	});

	it("records an attempt and shows the result", async () => {
		const user = userEvent.setup();
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ isCorrect: true }),
		});
		vi.stubGlobal("fetch", fetchMock);

		render(<McqPreview mcq={mcq} />);

		await user.click(screen.getByLabelText("Peacock"));
		await user.click(screen.getByRole("button", { name: "Submit answer" }));

		await waitFor(() => {
			expect(screen.getByText("Correct!")).toBeInTheDocument();
		});

		expect(fetchMock).toHaveBeenCalledWith("/api/mcqs/mcq-1/attempts", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ selectedChoiceId: "choice-2" }),
		});

		vi.unstubAllGlobals();
	});
});
