"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, MoreVertical, Pencil, Trash2 } from "lucide-react";

import { Button, ButtonLink } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { truncateText } from "@/lib/mcq/format";
import { MCQ_MESSAGES } from "@/lib/mcq/messages";
import type { McqSummary } from "@/lib/mcq/types";

type McqTableProps = {
	mcqs: McqSummary[];
};

export function McqTable({ mcqs }: McqTableProps) {
	const router = useRouter();
	const [deleteTarget, setDeleteTarget] = useState<McqSummary | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState<string>();

	async function confirmDelete() {
		if (!deleteTarget) {
			return;
		}

		setIsDeleting(true);
		setDeleteError(undefined);

		const response = await fetch(`/api/mcqs/${deleteTarget.id}`, {
			method: "DELETE",
		});

		if (!response.ok) {
			setDeleteError(MCQ_MESSAGES.server.unexpected);
			setIsDeleting(false);
			return;
		}

		setDeleteTarget(null);
		setIsDeleting(false);
		router.refresh();
	}

	if (mcqs.length === 0) {
		return (
			<div className="rounded-lg border border-dashed p-8 text-center">
				<p className="text-sm text-muted-foreground">
					You have not created any questions yet.
				</p>
				<ButtonLink href="/mcqs/new" className="mt-4">
					Create question
				</ButtonLink>
			</div>
		);
	}

	return (
		<>
			<div className="rounded-lg border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Question</TableHead>
							<TableHead className="w-16 text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{mcqs.map((mcq) => (
							<TableRow key={mcq.id}>
								<TableCell className="font-medium">{mcq.name}</TableCell>
								<TableCell className="max-w-md whitespace-normal">
									{truncateText(mcq.question)}
								</TableCell>
								<TableCell className="text-right">
									<DropdownMenu>
										<DropdownMenuTrigger
											aria-label={`Actions for ${mcq.name}`}
											className="inline-flex size-8 items-center justify-center rounded-lg border border-transparent hover:bg-muted"
										>
											<MoreVertical className="size-4" />
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem
												onClick={() => router.push(`/mcqs/${mcq.id}/edit`)}
											>
												<Pencil />
												Edit
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() =>
													router.push(`/mcqs/${mcq.id}/preview`)
												}
											>
												<Eye />
												Preview
											</DropdownMenuItem>
											<DropdownMenuItem
												variant="destructive"
												onClick={() => setDeleteTarget(mcq)}
											>
												<Trash2 />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<Dialog
				open={deleteTarget !== null}
				onOpenChange={(open) => {
					if (!open) {
						setDeleteTarget(null);
						setDeleteError(undefined);
					}
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{MCQ_MESSAGES.delete.title}</DialogTitle>
						<DialogDescription>{MCQ_MESSAGES.delete.body}</DialogDescription>
					</DialogHeader>
					{deleteError ? (
						<p className="text-sm text-destructive" role="alert">
							{deleteError}
						</p>
					) : null}
					<DialogFooter>
						<DialogClose render={<Button variant="outline" />}>
							Cancel
						</DialogClose>
						<Button
							variant="destructive"
							onClick={confirmDelete}
							disabled={isDeleting}
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
