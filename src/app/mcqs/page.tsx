import type { Metadata } from "next";

import { AppPageShell } from "@/components/app-page-shell";
import { McqTable } from "@/components/mcq/mcq-table";
import { ButtonLink } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/route-protection";
import { getMcqDependencies } from "@/lib/mcq/deps";
import { listMcqs } from "@/lib/services/mcq-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Questions | Quiz Maker",
	description: "Manage your multiple choice questions",
};

export default async function McqsPage() {
	const session = await requireSession();
	const dependencies = await getMcqDependencies();
	const mcqs = await listMcqs(session.userId, dependencies);

	return (
		<AppPageShell>
			<section aria-labelledby="mcqs-heading" className="space-y-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="space-y-1">
						<h1 id="mcqs-heading" className="text-2xl font-semibold">
							Multiple choice questions
						</h1>
						<p className="text-sm text-muted-foreground">
							Create, edit, preview, and delete your questions.
						</p>
					</div>
					<ButtonLink href="/mcqs/new">+ New question</ButtonLink>
				</div>
				<McqTable mcqs={mcqs} />
			</section>
		</AppPageShell>
	);
}
