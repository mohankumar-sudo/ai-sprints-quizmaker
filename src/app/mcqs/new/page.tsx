import type { Metadata } from "next";

import { AppPageShell } from "@/components/app-page-shell";
import { McqForm } from "@/components/mcq/mcq-form";
import { requireSession } from "@/lib/auth/route-protection";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Create question | Quiz Maker",
	description: "Create a multiple choice question",
};

export default async function NewMcqPage() {
	await requireSession();

	return (
		<AppPageShell>
			<McqForm mode="create" />
		</AppPageShell>
	);
}
