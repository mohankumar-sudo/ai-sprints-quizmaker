import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
			<div className="w-full max-w-md space-y-6 text-center">
				<div className="space-y-2">
					<h1 className="text-3xl font-semibold">Quiz Maker</h1>
					<p className="text-sm text-muted-foreground">
						Create, manage, and take quizzes online.
					</p>
				</div>
				<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
					<Link href="/sign-in" className="w-full sm:w-auto">
						<Button className="min-h-11 w-full">Sign In</Button>
					</Link>
					<Link href="/sign-up" className="w-full sm:w-auto">
						<Button variant="outline" className="min-h-11 w-full">
							Sign Up
						</Button>
					</Link>
				</div>
			</div>
		</main>
	);
}
