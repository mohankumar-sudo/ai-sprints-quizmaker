import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SignUpForm } from "@/components/auth/sign-up-form";
import { PASSWORD_REQUIREMENTS_TEXT } from "@/lib/auth/password-requirements";

vi.mock("@/app/sign-up/actions", () => ({
	signUpAction: vi.fn(),
}));

describe("SignUpForm accessibility", () => {
	it("renders visible labels for all fields", () => {
		render(<SignUpForm />);

		expect(screen.getByLabelText(/^full name$/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/^email address$/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/^confirm password$/i)).toBeInTheDocument();
	});

	it("describes password requirements without relying on colour alone", () => {
		render(<SignUpForm />);

		expect(screen.getByText(PASSWORD_REQUIREMENTS_TEXT)).toBeInTheDocument();
	});

	it("announces validation errors in a live region", () => {
		render(<SignUpForm />);

		const form = screen.getByRole("form", { name: "Sign up" });
		expect(form.querySelector('[aria-live="polite"]')).toBeTruthy();
	});

	it("uses a full-width layout for narrow viewports", () => {
		const { container } = render(<SignUpForm />);

		expect(container.querySelector(".w-full")).toBeTruthy();
	});
});
