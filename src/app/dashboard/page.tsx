import type { Metadata } from "next";

import { LogoutButton } from "@/components/auth/logout-button";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
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
				className="space-y-4 text-center"
			>
				<div className="space-y-2">
					<h1 id="dashboard-heading" className="text-2xl font-semibold">
						Welcome, {session.name}
					</h1>
					<p className="text-sm text-muted-foreground">{session.email}</p>
					<p className="text-sm text-muted-foreground">
						You are signed in. Quiz features will be added in later sprints.
					</p>
				</div>
				<LogoutButton />
			</section>
		</AuthPageShell>
	);
}
