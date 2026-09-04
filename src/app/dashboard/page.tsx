import type { Metadata } from "next";

import { LogoutButton } from "@/components/auth/logout-button";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ButtonLink } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/route-protection";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Dashboard | Quiz Maker",
	description: "Quiz Maker dashboard",
};

export default async function DashboardPage() {
	const session = await requireSession();

	return (
		<AuthPageShell>
			<section
				aria-labelledby="dashboard-heading"
				className="space-y-6 text-center"
			>
				<div className="space-y-2">
					<h1 id="dashboard-heading" className="text-2xl font-semibold">
						Welcome, {session.name}
					</h1>
					<p className="text-sm text-muted-foreground">{session.email}</p>
					<p className="text-sm text-muted-foreground">
						Manage your multiple choice questions or sign out when you are done.
					</p>
				</div>
				<div className="flex flex-col items-center gap-3">
					<ButtonLink href="/mcqs">Manage questions</ButtonLink>
					<LogoutButton />
				</div>
			</section>
		</AuthPageShell>
	);
}
