"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";

export function LogoutButton() {
	const router = useRouter();
	const [isPending, setIsPending] = useState(false);

	async function handleLogout() {
		setIsPending(true);
		await authClient.signOut();
		router.push("/sign-in");
		router.refresh();
	}

	return (
		<Button
			type="button"
			variant="outline"
			className="min-h-11 w-full sm:w-auto"
			disabled={isPending}
			aria-busy={isPending}
			aria-label="Sign out"
			onClick={handleLogout}
		>
			{isPending ? "Signing out..." : "Log out"}
		</Button>
	);
}
