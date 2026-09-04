import { cn } from "@/lib/utils";

type AuthPageShellProps = {
	children: React.ReactNode;
	className?: string;
};

export function AuthPageShell({ children, className }: AuthPageShellProps) {
	return (
		<main
			className={cn(
				"flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 sm:py-12",
				className,
			)}
		>
			<div className="w-full min-w-0 max-w-md">{children}</div>
		</main>
	);
}
