"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { FormAlert } from "@/components/auth/form-alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/auth-client";
import { AUTH_MESSAGES } from "@/lib/auth/messages";
import type { SignInField } from "@/lib/auth/validation";
import { validateSignIn } from "@/lib/auth/validation";

type SignInFormProps = {
	showRegistrationSuccess?: boolean;
};

export function SignInForm({
	showRegistrationSuccess = false,
}: SignInFormProps) {
	const router = useRouter();
	const [errors, setErrors] = useState<Partial<Record<SignInField, string>>>(
		{},
	);
	const [formError, setFormError] = useState<string>();
	const [isPending, setIsPending] = useState(false);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setErrors({});
		setFormError(undefined);
		setIsPending(true);

		const formData = new FormData(event.currentTarget);
		const input = {
			email: String(formData.get("email") ?? ""),
			password: String(formData.get("password") ?? ""),
		};

		const validation = validateSignIn(input);
		if (!validation.success) {
			setErrors(validation.errors);
			setIsPending(false);
			return;
		}

		const { error } = await authClient.signIn.email({
			email: validation.data.email,
			password: validation.data.password,
		});

		if (error) {
			setFormError(AUTH_MESSAGES.signIn.invalidCredentials);
			setIsPending(false);
			return;
		}

		router.push("/dashboard");
		router.refresh();
	}

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Sign in to Quiz Maker</CardTitle>
				<CardDescription>
					Enter your email and password to access your account.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={handleSubmit}
					aria-label="Sign in"
					className="space-y-5"
					noValidate
				>
					<FieldGroup aria-live="polite" aria-atomic="true">
						{showRegistrationSuccess ? (
							<FormAlert variant="success">
								Account created successfully. Please sign in.
							</FormAlert>
						) : null}

						{formError ? <FormAlert>{formError}</FormAlert> : null}

						<Field data-invalid={!!errors.email}>
							<FieldLabel htmlFor="sign-in-email">Email</FieldLabel>
							<Input
								id="sign-in-email"
								name="email"
								type="email"
								autoComplete="email"
								required
								aria-invalid={!!errors.email}
								aria-describedby={
									errors.email ? "sign-in-email-error" : undefined
								}
							/>
							<FieldError
								id="sign-in-email-error"
								errors={[{ message: errors.email }]}
							/>
						</Field>

						<Field data-invalid={!!errors.password}>
							<FieldLabel htmlFor="sign-in-password">Password</FieldLabel>
							<Input
								id="sign-in-password"
								name="password"
								type="password"
								autoComplete="current-password"
								required
								aria-invalid={!!errors.password}
								aria-describedby={
									errors.password ? "sign-in-password-error" : undefined
								}
							/>
							<FieldError
								id="sign-in-password-error"
								errors={[{ message: errors.password }]}
							/>
						</Field>
					</FieldGroup>

					<Button
						type="submit"
						className="min-h-11 w-full"
						disabled={isPending}
						aria-busy={isPending}
					>
						{isPending ? "Signing in..." : "Sign In"}
					</Button>
				</form>
			</CardContent>
			<CardFooter className="justify-center">
				<p className="text-sm text-muted-foreground">
					Don&apos;t have an account?{" "}
					<Link
						href="/sign-up"
						className="text-primary underline-offset-4 hover:underline"
					>
						Sign up
					</Link>
				</p>
			</CardFooter>
		</Card>
	);
}
