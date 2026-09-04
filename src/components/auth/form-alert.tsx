import { cn } from "@/lib/utils";

type FormAlertProps = {
	children: React.ReactNode;
	variant?: "error" | "success";
};

export function FormAlert({ children, variant = "error" }: FormAlertProps) {
	return (
		<div
			role="alert"
			aria-live="polite"
			aria-atomic="true"
			className={cn(
				"rounded-lg px-3 py-2 text-sm",
				variant === "error" &&
					"border border-destructive/30 bg-destructive/10 text-destructive",
				variant === "success" &&
					"border border-primary/30 bg-primary/10 text-foreground",
			)}
		>
			{children}
		</div>
	);
}
