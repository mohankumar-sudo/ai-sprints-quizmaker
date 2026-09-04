import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AppPageShell } from "@/components/app-page-shell";
import { McqForm } from "@/components/mcq/mcq-form";
import { requireSession } from "@/lib/auth/route-protection";
import { getMcqDependencies } from "@/lib/mcq/deps";
import { getMcq } from "@/lib/services/mcq-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Edit question | Quiz Maker",
	description: "Edit a multiple choice question",
};

type EditMcqPageProps = {
	params: Promise<{ id: string }>;
};

export default async function EditMcqPage({ params }: EditMcqPageProps) {
	const session = await requireSession();
	const { id } = await params;
	const dependencies = await getMcqDependencies();
	const mcq = await getMcq(id, session.userId, dependencies);

	if (!mcq) {
		notFound();
	}

	return (
		<AppPageShell>
			<McqForm
				mode="edit"
				mcqId={mcq.id}
				initialValues={{
					name: mcq.name,
					question: mcq.question,
					choices: mcq.choices.map((choice) => ({
						choiceText: choice.choiceText,
						isCorrect: choice.isCorrect,
					})),
				}}
			/>
		</AppPageShell>
	);
}
