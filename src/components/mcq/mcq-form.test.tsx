import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { McqForm } from "@/components/mcq/mcq-form";

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		refresh: vi.fn(),
	}),
}));

describe("McqForm", () => {
	it("starts with two choice rows on create", () => {
		render(<McqForm mode="create" />);

		expect(screen.getByLabelText("Choice 1")).toBeInTheDocument();
		expect(screen.getByLabelText("Choice 2")).toBeInTheDocument();
		expect(screen.queryByLabelText("Choice 3")).not.toBeInTheDocument();
	});

	it("adds and removes choices within the allowed range", async () => {
		const user = userEvent.setup();
		render(<McqForm mode="create" />);

		await user.click(screen.getByRole("button", { name: "Add choice" }));
		expect(screen.getByLabelText("Choice 3")).toBeInTheDocument();

		await user.click(screen.getAllByRole("button", { name: "Remove" })[2]!);
		expect(screen.queryByLabelText("Choice 3")).not.toBeInTheDocument();
	});

	it("shows validation errors for empty required fields", async () => {
		const user = userEvent.setup();
		render(<McqForm mode="create" />);

		await user.click(screen.getByRole("button", { name: "Save" }));

		expect(screen.getByText("Name is required.")).toBeInTheDocument();
		expect(screen.getByText("Question is required.")).toBeInTheDocument();
		expect(screen.getByText("Choice text is required.")).toBeInTheDocument();
	});
});
