import type { Metadata } from "next";

import { SignInForm } from "@/components/auth/sign-in-form";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { redirectIfAuthenticated } from "@/lib/auth/route-protection";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Sign In | Quiz Maker",
	description: "Sign in to Quiz Maker",
};

type SignInPageProps = {
	searchParams: Promise<{ registered?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
	await redirectIfAuthenticated();
	const { registered } = await searchParams;

	return (
		<AuthPageShell>
			<SignInForm showRegistrationSuccess={registered === "1"} />
		</AuthPageShell>
	);
}
