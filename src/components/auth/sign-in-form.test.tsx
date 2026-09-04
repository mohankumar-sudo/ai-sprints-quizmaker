import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SignInForm } from "@/components/auth/sign-in-form";

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		refresh: vi.fn(),
	}),
}));

vi.mock("@/lib/auth/auth-client", () => ({
	authClient: {
		signIn: {
			email: vi.fn(),
		},
	},
}));

describe("SignInForm accessibility", () => {
	it("renders visible labels for email and password", () => {
		render(<SignInForm />);

		expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
	});

	it("announces validation and auth errors in a live region", () => {
		render(<SignInForm />);

		const form = screen.getByRole("form", { name: "Sign in" });
		expect(form.querySelector('[aria-live="polite"]')).toBeTruthy();
	});

	it("shows registration success feedback when requested", () => {
		render(<SignInForm showRegistrationSuccess />);

		expect(
			screen.getByText("Account created successfully. Please sign in."),
		).toBeInTheDocument();
	});

	it("uses a full-width layout for narrow viewports", () => {
		const { container } = render(<SignInForm />);

		expect(container.querySelector(".w-full")).toBeTruthy();
	});
});
