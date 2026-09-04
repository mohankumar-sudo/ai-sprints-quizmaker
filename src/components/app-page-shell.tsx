import type { ReactNode } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { ButtonLink } from "@/components/ui/button";import { cn } from "@/lib/utils";

type AppPageShellProps = {
	children: ReactNode;
	className?: string;
};

export function AppPageShell({ children, className }: AppPageShellProps) {
	return (
		<main
			className={cn(
				"mx-auto min-h-screen w-full max-w-5xl px-4 py-8 sm:px-6",
				className,
			)}
		>
			<header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-wrap items-center gap-3">
					<ButtonLink variant="ghost" href="/dashboard">
						Dashboard
					</ButtonLink>
					<ButtonLink variant="ghost" href="/mcqs">
						Questions
					</ButtonLink>
				</div>
				<LogoutButton />
			</header>
			{children}
		</main>
	);
}
