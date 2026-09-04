import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AppPageShell } from "@/components/app-page-shell";
import { McqPreview } from "@/components/mcq/mcq-preview";
import { requireSession } from "@/lib/auth/route-protection";
import { getMcqDependencies } from "@/lib/mcq/deps";
import { getMcq } from "@/lib/services/mcq-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Preview question | Quiz Maker",
	description: "Preview and try answering a multiple choice question",
};

type PreviewMcqPageProps = {
	params: Promise<{ id: string }>;
};

export default async function PreviewMcqPage({ params }: PreviewMcqPageProps) {
	const session = await requireSession();
	const { id } = await params;
	const dependencies = await getMcqDependencies();
	const mcq = await getMcq(id, session.userId, dependencies);

	if (!mcq) {
		notFound();
	}

	return (
		<AppPageShell>
			<McqPreview mcq={mcq} />
		</AppPageShell>
	);
}
