import type { Metadata } from "next";

import { SignUpForm } from "@/components/auth/sign-up-form";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { redirectIfAuthenticated } from "@/lib/auth/route-protection";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Sign Up | Quiz Maker",
	description: "Create a Quiz Maker account",
};

export default async function SignUpPage() {
	await redirectIfAuthenticated();

	return (
		<AuthPageShell>
			<SignUpForm />
		</AuthPageShell>
	);
}
